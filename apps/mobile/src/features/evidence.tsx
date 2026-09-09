import { t } from '@suraksha/shared';
import React, { useState } from 'react';
import { Text, View, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api, useData, evidenceBytes } from '../lib/api';
import { ScreenProps } from '../lib/context';
import { Page, Card, Button, Choice, Input, State, Trust, s } from '../components/ui';
export function EvidenceScreen({ navigation: n, route }: ScreenProps) {
  const id = route.name;
  const vault = useData<any[]>(id === 'M18' ? '/evidence' : null);
  const detail = useData(id === 'M20' && route.params?.id ? '/evidence/' + route.params.id : null);
  const analysis = useData(
    id === 'M22' && route.params?.id ? '/analysis/' + route.params.id : null,
  );
  const [kind, setKind] = useState('Photo');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [text, setText] = useState('');
  const [pin, setPin] = useState('');
  const [preview, setPreview] = useState('');
  const [imagePreview,setImagePreview]=useState('');
  const [scan, setScan] = useState<any>(null);
  if (id === 'M18')
    return (
      <Page
        title={t('Evidence Vault')}
        tag="EVIDENCE VAULT"
        subtitle={`${vault.data?.length || 0} items · Tamper-evident copies`}
        nav
        navigation={n}
      >
        <State query={vault} />
        {!vault.data?.length && !vault.isLoading && (
          <Text style={s.muted}>
            {t('Your vault is empty. Add evidence to preserve it securely.')}
          </Text>
        )}
        {vault.data?.map((e) => (
          <Card key={e.id} onPress={() => n.navigate('M20', { id: e.id })}>
            <View style={s.row}>
              <Text style={{ fontSize: 24 }}>{t('\u25A2')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.text}>{e.filename}</Text>
                <Text style={s.muted}>{new Date(e.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={s.badge}>{e.kind}</Text>
            </View>
          </Card>
        ))}
        <Button title={t('\uFF0B Add evidence')} tone="blue" onPress={() => n.navigate('M19')} />
        <Trust text="ENCRYPTED AT REST · TAMPER-EVIDENT" />
      </Page>
    );
  if (id === 'M19')
    return (
      <Page
        title={t('Add evidence')}
        tag="ADD EVIDENCE"
        subtitle={t('Choose a type to capture or import')}
      >
        {['Photo', 'Audio', 'Video', 'Chat log'].map((x) => (
          <Choice key={x} label={x} selected={kind === x} onPress={() => setKind(x)} />
        ))}
        <Button
          title={file ? file.name : 'Choose file to import'}
          tone="outline"
          onPress={async () => {
            const result = await DocumentPicker.getDocumentAsync({
              type:
                kind === 'Photo'
                  ? 'image/*'
                  : kind === 'Audio'
                    ? 'audio/*'
                    : kind === 'Video'
                      ? 'video/*'
                      : '*/*',
              copyToCacheDirectory: true,
            });
            if (!result.canceled) setFile(result.assets[0] || null);
          }}
        />
        <Input
          label={t('Note (optional) \u2014 what happened, when, where\u2026')}
          value={note}
          onChange={setNote}
          multiline
        />
        <Button
          title={t('Encrypt & save')}
          onPress={async () => {
            if (!file) throw new Error('Choose a file first');
            const data = new FormData();
            data.append('file', {
              uri: file.uri,
              name: file.name,
              type: file.mimeType || 'application/octet-stream',
            } as unknown as Blob);
            data.append('kind', kind);
            data.append('note', note);
            const item = await api('/evidence', 'POST', data);
            n.replace('M20', { id: item.id });
          }}
        />
        <Trust text="AES-256-GCM ENCRYPTION AT REST" />
      </Page>
    );
  if (id === 'M20')
    return (
      <Page
        title={detail.data?.filename || 'Sealed record'}
        tag="LOCKED RECORD"
        subtitle={t('Evidence detail')}
      >
        <State query={detail} />
        <Card>
          <Text style={[s.text, { textAlign: 'center' }]}>{t('\u2659 Encrypted preview')}</Text>
          <Input
            label={t('Unlock with 6-digit PIN')}
            value={pin}
            onChange={setPin}
            secure
            keyboardType="numeric"
          />
          <Button
            title={t('Verify & unlock preview')}
            tone="outline"
            onPress={async () => {
              const result = await api(`/evidence/${route.params.id}/unlock`, 'POST', { pin });
              const bytes = await evidenceBytes(route.params.id, result.proof);
              if(detail.data.mediaType.startsWith('image/')&&bytes.length<=5*1024*1024){
                const base64=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));
                setImagePreview('data:'+detail.data.mediaType+';base64,'+base64);
              }
              setPreview(
                detail.data.mediaType.startsWith('text/')
                  ? new TextDecoder().decode(bytes)
                  : `Integrity verified. ${bytes.length} decrypted bytes. Binary display is not enabled in this prototype viewer.`,
              );
              setPin('');
            }}
          />
          {imagePreview&&<Image accessibilityLabel="Unlocked evidence preview" source={{uri:imagePreview}} style={{height:300,width:'100%'}} resizeMode="contain"/>}
          {preview && <Text style={s.text}>{preview}</Text>}
        </Card>
        <Card>
          <Text style={s.text}>{t('Captured')}</Text>
          <Text style={s.muted}>
            {detail.data?.capturedAt && new Date(detail.data.capturedAt).toLocaleString()}
          </Text>
        </Card>
        <Card>
          <Text style={s.text}>{t('Location tag')}</Text>
          <Text style={s.muted}>{detail.data?.locationTag || 'Not supplied'}</Text>
        </Card>
        <Card>
          <Text style={s.text}>{t('Hash sealed')}</Text>
          <Text selectable style={s.muted}>
            {detail.data?.sha256}
          </Text>
          <Text style={s.badge}>{t('SHA-256 recorded \u00B7 verified on download')}</Text>
        </Card>
        <Button
          title={t('Attach to report')}
          tone="outline"
          onPress={() => n.navigate('M24', { evidenceIds: [route.params.id] })}
        />
        <Trust />
      </Page>
    );
  if (id === 'M21')
    return (
      <Page
        title={t('Scan a message')}
        tag="AI DETECTION"
        subtitle={t('We\u2019ll check text for harassment patterns')}
      >
        <Card>
          <Text style={s.text}>{t('Upload screenshot or paste text')}</Text>
          <Text style={s.muted}>
            {t('Screenshot OCR is not connected. Paste the message text below to analyze it.')}
          </Text>
        </Card>
        <Input label={t('Message text')} value={text} onChange={setText} multiline />
        <Button
          title={t('Analyse with AI')}
          tone="blue"
          onPress={async () => {
            const result = await api('/analysis', 'POST', { text, language: 'auto' });
            setScan(result);
          }}
        />
        {scan && (
          <Card>
            <Text style={s.text}>{scan.classification}</Text>
            <Text style={s.muted}>{scan.explanation}</Text>
            <Text style={s.badge}>{t('Development model \u00B7 confidence unavailable')}</Text>
            <Button
              title={t('View full analysis')}
              onPress={() => n.navigate('M22', { id: scan.id })}
            />
            <Button title={t('Dismiss')} tone="outline" onPress={() => setScan(null)} />
            <Button
              title={t('Escalate to Legal Aid')}
              tone="red"
              onPress={() => n.navigate('M23')}
            />
          </Card>
        )}
        <Trust text="DEVELOPMENT ANALYSIS · NON-VALIDATED" />
      </Page>
    );
  return (
    <Page
      title={t('Analysis result')}
      tag="AI RESULT"
      subtitle={t('Based on your submitted message')}
    >
      <State query={analysis} />
      <Card>
        <Text style={s.text}>
          {analysis.data?.riskLevel}
          {t('\u00B7')}
          {analysis.data?.classification}
        </Text>
        <Text style={s.muted}>{analysis.data?.explanation}</Text>
        <Text style={s.muted}>
          {t('Model:')}
          {analysis.data?.modelVersion}
        </Text>
        <Text style={s.badge}>{analysis.data?.validationStatus}</Text>
      </Card>
      <View style={s.row}>
        <Card style={{ flex: 1 }}>
          <Text style={s.muted}>{t('Save to vault')}</Text>
          <Text style={s.text}>{analysis.data?.evidenceId ? 'Saved ✓' : 'Not saved'}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={s.muted}>{t('File a report')}</Text>
          <Text style={s.text}>{t('Your choice')}</Text>
        </Card>
      </View>
      <Button title={t('Talk to Legal Chatbot')} onPress={() => n.navigate('M23')} />
      <Button
        title={t('File a report')}
        tone="blue"
        onPress={() => n.navigate('M24', { evidenceIds: [analysis.data?.evidenceId] })}
      />
      <Text style={s.section}>{t('What happens next')}</Text>
      <Text style={s.text}>
        {t('\u2713 Evidence encrypted')}
        {'\n'}
        {t('\u2713 Available in your vault')}
        {'\n'}
        {t('\u2022 Legal Aid notified only when you choose human escalation')}
      </Text>
    </Page>
  );
}
