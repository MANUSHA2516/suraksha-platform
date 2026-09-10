import { AppState } from 'react-native';
let activeUntil = 0;
let relock = () => {};
export function setDeviceRelock(handler: () => void) {
  relock = handler;
}
export function isDeviceInteraction() {
  return Date.now() < activeUntil;
}
/** A user-initiated system picker must not destroy its pending screen when Android changes activities. */
export async function withDeviceInteraction<T>(action: () => Promise<T>): Promise<T> {
  activeUntil = Date.now() + 5 * 60_000;
  try {
    return await action();
  } finally {
    activeUntil = 0;
    if (deviceIsBackgrounded()) relock();
  }
}
export function deviceIsBackgrounded() {
  return AppState.currentState === 'background';
}
