jest.mock('expo-crypto', () => ({ randomUUID: () => '11111111-1111-4111-8111-111111111111' }));
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(false),
  authenticateAsync: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({granted:false}),
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

jest.mock('expo-notifications',()=>({requestPermissionsAsync:jest.fn().mockResolvedValue({granted:false}),scheduleNotificationAsync:jest.fn()}));
