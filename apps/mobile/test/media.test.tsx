import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { deviceMedia } from '../src/providers/media';
import { EvidenceMediaPreview, AudioCapture } from '../src/components/evidence-media';
import { isDeviceInteraction } from '../src/lib/device-interaction';
beforeEach(() => jest.clearAllMocks());
it('denied camera permission never launches the camera and releases the activity guard', async () => {
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  await expect(deviceMedia.capture('Photo')).rejects.toThrow('Camera permission denied');
  expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  expect(isDeviceInteraction()).toBe(false);
});
it('maps a successful native capture into upload metadata without a public URL', async () => {
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///cache/photo.jpg', mimeType: 'image/jpeg', fileSize: 250 }],
  });
  const result = await deviceMedia.capture('Photo');
  expect(result).toEqual(
    expect.objectContaining({ uri: 'file:///cache/photo.jpg', mimeType: 'image/jpeg', size: 250 }),
  );
  expect(isDeviceInteraction()).toBe(false);
});
it('removes the decrypted playback file when the evidence preview unmounts', async () => {
  const view = render(
    <EvidenceMediaPreview bytes={new Uint8Array([1, 2, 3])} mediaType="audio/mp4" />,
  );
  await waitFor(() => expect(view.getByLabelText('Play audio')).toBeTruthy());
  const file = (File as unknown as jest.Mock).mock.results.at(-1)!.value;
  expect(file.write).toHaveBeenCalled();
  view.unmount();
  expect(file.delete).toHaveBeenCalled();
});
it('microphone denial remains an actionable error without producing a recording', async () => {
  const captured = jest.fn();
  const view = render(<AudioCapture onCaptured={captured} />);
  fireEvent.press(view.getByLabelText('Record audio'));
  await waitFor(() =>
    expect(
      view.getByText('Microphone permission denied. You can still import audio.'),
    ).toBeTruthy(),
  );
  expect(captured).not.toHaveBeenCalled();
});
