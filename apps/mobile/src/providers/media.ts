import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { withDeviceInteraction } from '../lib/device-interaction';
export type EvidenceFile = { uri: string; name: string; mimeType?: string; size?: number };
export interface MediaProvider {
  capture(kind: 'Photo' | 'Video'): Promise<EvidenceFile | null>;
  import(kind: string): Promise<EvidenceFile | null>;
}
export const deviceMedia: MediaProvider = {
  capture: (kind) =>
    withDeviceInteraction(async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted)
        throw new Error('Camera permission denied. You can still import a file.');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: kind === 'Photo' ? ['images'] : ['videos'],
        quality: 0.8,
        videoMaxDuration: 120,
      });
      if (result.canceled) return null;
      const file = result.assets[0];
      if (!file) return null;
      return {
        uri: file.uri,
        name: file.fileName || (kind === 'Photo' ? 'Captured-photo.jpg' : 'Captured-video.mp4'),
        mimeType: file.mimeType || (kind === 'Photo' ? 'image/jpeg' : 'video/mp4'),
        size: file.fileSize,
      };
    }),
  import: (kind) =>
    withDeviceInteraction(async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type:
          kind === 'Photo'
            ? 'image/*'
            : kind === 'Video'
              ? 'video/*'
              : kind === 'Audio'
                ? 'audio/*'
                : '*/*',
        copyToCacheDirectory: true,
      });
      return result.canceled ? null : result.assets[0] || null;
    }),
};
