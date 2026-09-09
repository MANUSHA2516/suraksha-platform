"""Reproducible, standard-library DOCX extraction; preserves paragraphs, tables and image anchors."""
from pathlib import Path
import hashlib
import json
import zipfile
import xml.etree.ElementTree as ET

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
ROOT = Path(__file__).resolve().parents[1]
manifest = []
for source in sorted(ROOT.glob('*.docx')):
    target = ROOT / 'docs' / 'sources' / source.stem
    target.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(source) as archive:
        xml = archive.read('word/document.xml')
        document = ET.fromstring(xml)
        relationships = ET.fromstring(archive.read('word/_rels/document.xml.rels'))
        rels = {r.attrib['Id']: r.attrib['Target'] for r in relationships}
        lines, anchors, blocks = [], [], []
        for index, paragraph in enumerate(document.findall('.//w:p', NS), 1):
            text = ''.join(t.text or '' for t in paragraph.findall('.//w:t', NS))
            lines.append(text)
            for drawing in paragraph.findall('.//a:blip', NS):
                anchors.append({'paragraph': index, 'target': rels.get(drawing.get('{'+NS['r']+'}embed')), 'preceding_text': next((s for s in reversed(lines) if s.strip()), '')})
        for node in document.find('w:body', NS):
            if node.tag == '{'+NS['w']+'}tbl':
                rows = [[' '.join(t.text or '' for t in cell.findall('.//w:t', NS)) for cell in row.findall('w:tc', NS)] for row in node.findall('w:tr', NS)]
                blocks.append({'type': 'table', 'rows': rows})
            else:
                blocks.append({'type': 'paragraph', 'text': ''.join(t.text or '' for t in node.findall('.//w:t', NS))})
        media = [n for n in archive.namelist() if n.startswith(('word/media/', 'word/embeddings/')) and not n.endswith('/')]
        for name in media:
            (target / Path(name).name).write_bytes(archive.read(name))
        (target / 'text.txt').write_text('\n'.join(lines))
        (target / 'document.xml').write_bytes(xml)
        (target / 'blocks.json').write_text(json.dumps(blocks, ensure_ascii=False, indent=2))
        (target / 'image-anchors.json').write_text(json.dumps(anchors, ensure_ascii=False, indent=2))
        manifest.append({'source': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'paragraphs': len(lines), 'tables': sum(b['type']=='table' for b in blocks), 'media': media, 'image_anchors': len(anchors)})
(ROOT / 'docs' / 'sources' / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print(f'Extracted {len(manifest)} source documents and {sum(len(m["media"]) for m in manifest)} media files.')
