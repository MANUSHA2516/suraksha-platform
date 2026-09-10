jest.mock('expo-crypto', () => ({ randomUUID: () => '11111111-1111-4111-8111-111111111111' }));
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(false),
  authenticateAsync: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
  Accuracy: { Balanced: 3 },
}));
jest.mock('../src/lib/api', () => ({
  api: jest.fn(),
  saveSession: jest.fn(),
  signOut: jest.fn(),
  evidenceBytes: jest.fn(),
  useData: jest.fn(() => ({ data: null, isLoading: false, error: null, refetch: jest.fn() })),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  scheduleNotificationAsync: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  launchCameraAsync: jest.fn(),
}));
jest.mock('expo-audio', () => ({
  useAudioRecorder: jest.fn(() => ({
    prepareToRecordAsync: jest.fn(),
    record: jest.fn(),
    stop: jest.fn(),
  })),
  useAudioRecorderState: jest.fn(() => ({ isRecording: false, durationMillis: 0 })),
  useAudioPlayer: jest.fn(() => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() })),
  useAudioPlayerStatus: jest.fn(() => ({ playing: false })),
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  setAudioModeAsync: jest.fn(),
}));
jest.mock('expo-video', () => ({ useVideoPlayer: jest.fn(), VideoView: 'VideoView' }));
jest.mock('expo-file-system', () => ({
  File: jest
    .fn()
    .mockImplementation(() => ({
      uri: 'file:///cache/preview',
      exists: true,
      write: jest.fn(),
      delete: jest.fn(),
    })),
  Paths: { cache: { uri: 'file:///cache/', list: jest.fn(() => []) } },
}));
