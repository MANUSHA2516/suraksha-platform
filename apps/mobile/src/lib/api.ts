import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';
import type { Session } from '@suraksha/types';
export const base = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/v1';
let token: string | null = null;
let refreshPromise: Promise<void> | null = null;
export async function saveSession(session: Session) {
  token = session.accessToken;
  await SecureStore.setItemAsync('suraksha.refresh', session.refreshToken);
}
export async function restoreSession() {
  const refreshToken = await SecureStore.getItemAsync('suraksha.refresh');
  if (!refreshToken) throw new Error('Sign in to continue');
  const res = await fetch(base + '/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Session expired; sign in again');
  const session: Session = await res.json();
  await saveSession(session);
  return session.user;
}
export async function signOut() {
  try {
    await api('/auth/logout', 'POST');
  } catch {
    /* Clear local credentials even when the server session has expired. */
  } finally {
    token = null;
    await SecureStore.deleteItemAsync('suraksha.refresh');
  }
}
export async function api<T = any>(
  path: string,
  method = 'GET',
  body?: unknown,
  retry = true,
): Promise<T> {
  const form = body instanceof FormData;
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(form ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body === undefined ? {} : { body: form ? body : JSON.stringify(body) }),
  });
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    refreshPromise ??= restoreSession()
      .then(() => {})
      .finally(() => {
        refreshPromise = null;
      });
    await refreshPromise;
    return api(path, method, body, false);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Request failed (${response.status})`);
  }
  return response.json();
}
export function useData<T = any>(path: string | null) {
  return useQuery<T>({
    queryKey: [path],
    queryFn: () => api<T>(path!),
    enabled: !!path,
    refetchInterval: path?.startsWith('/sos/') || path?.includes('messages') ? 5000 : false,
    retry: 1,
  });
}
export async function evidenceBytes(id: string, proof: string) {
  const response = await fetch(base + `/evidence/${id}/content`, {
    headers: { Authorization: 'Bearer ' + token, 'X-Unlock-Proof': proof },
  });
  if (!response.ok) throw new Error('Evidence preview denied');
  return new Uint8Array(await response.arrayBuffer());
}
