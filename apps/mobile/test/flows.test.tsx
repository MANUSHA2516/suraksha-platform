import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReportingScreen } from '../src/features/reporting';
import { SafetyScreen } from '../src/features/safety';
import { OnboardingScreen } from '../src/features/onboarding';
import { EvidenceScreen } from '../src/features/evidence';
import { WellbeingScreen } from '../src/features/wellbeing';
import { api, useData } from '../src/lib/api';
const nav = { navigate: jest.fn(), replace: jest.fn(), canGoBack: () => false, goBack: jest.fn() };
function wrap(node: React.ReactNode) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, bottom: 0, left: 0, right: 0 },
      }}
    >
      {node}
    </SafeAreaProvider>
  );
}
beforeEach(() => {
  jest.clearAllMocks();
  (useData as jest.Mock).mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  });
});
it('submits the documented anonymous report and navigates with the returned shared reference', async () => {
  (api as jest.Mock).mockResolvedValue({ reference: 'SL-9001' });
  const screen = render(
    wrap(
      <ReportingScreen
        navigation={nav}
        route={{ name: 'M25', params: { category: 'CYBER_HARASSMENT' } }}
      />,
    ),
  );
  fireEvent.changeText(screen.getByLabelText('Describe briefly (optional)'), 'A synthetic report');
  fireEvent.press(screen.getByLabelText('Submit report ➤'));
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      '/reports',
      'POST',
      expect.objectContaining({
        anonymous: true,
        description: 'A synthetic report',
        category: 'CYBER_HARASSMENT',
      }),
    ),
  );
  await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('M26', { reference: 'SL-9001' }));
});
it('releasing before two seconds prevents SOS activation', () => {
  jest.useFakeTimers();
  const screen = render(wrap(<SafetyScreen navigation={nav} route={{ name: 'M13' }} />));
  const button = screen.getByLabelText('Hold for two seconds to activate SOS');
  fireEvent(button, 'pressIn');
  jest.advanceTimersByTime(1000);
  fireEvent(button, 'pressOut');
  jest.advanceTimersByTime(2000);
  expect(api).not.toHaveBeenCalled();
  jest.useRealTimers();
});
for (let i = 1; i <= 31; i++) {
  const id = 'M' + String(i).padStart(2, '0');
  it(`renders documented screen ${id} with empty/loading-safe data`, () => {
    const Component =
      i <= 11
        ? OnboardingScreen
        : i <= 17
          ? SafetyScreen
          : i <= 22
            ? EvidenceScreen
            : i <= 28
              ? ReportingScreen
              : WellbeingScreen;
    const screen = render(
      wrap(
        <Component
          navigation={nav}
          route={{
            name: id,
            params: { id: 'fixture', reference: i === 26 ? 'SL-2291' : undefined },
          }}
        />,
      ),
    );
    expect(screen.toJSON()).toBeTruthy();
  });
}
