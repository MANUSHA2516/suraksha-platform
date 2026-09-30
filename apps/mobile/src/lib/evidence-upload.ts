import { File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import type { EvidenceFile } from '../providers/media';
export async function prepareEvidence(
  file: EvidenceFile | null,
  kind: string,
  text: string,
  note: string,
) {
  let temporary: File | null = null;
  let selected = file;
  if (kind === 'Chat log' && text.trim()) {
    temporary = new File(Paths.cache, `captured-${randomUUID()}.txt`);
    temporary.write(text);
    selected = {
      uri: temporary.uri,
      name: 'Chat-log.txt',
      mimeType: 'text/plain',
      size: temporary.size,
    };
  }
  if (!selected) throw new Error('Choose or capture evidence first');
  if (selected.size && selected.size > 25 * 1024 * 1024) {
    temporary?.delete();
    throw new Error('Choose a file smaller than 25 MB');
  }
  const data = new FormData();
  data.append('file', {
    uri: selected.uri,
    name: selected.name,
    type: selected.mimeType || 'application/octet-stream',
  } as unknown as Blob);
  data.append('kind', kind);
  data.append('note', note);
  return {
    data,
    cleanup: () => {
      if (temporary?.exists) temporary.delete();
    },
  };
}
