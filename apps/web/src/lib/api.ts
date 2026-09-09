'use client';
import { useCallback, useEffect, useState } from 'react';
export const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
let refreshing: Promise<boolean> | null = null;
export async function api<T = any>(
  path: string,
  method = 'GET',
  body?: unknown,
  retry = true,
): Promise<T> {
  const response = await fetch(apiBase + path, {
    method,
    credentials: 'include',
    headers:
      body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json', 'X-Suraksha-Client': 'web' },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    refreshing ??= fetch(apiBase + '/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Suraksha-Client': 'web' },
      body: '{}',
    })
      .then((r) => r.ok)
      .finally(() => {
        refreshing = null;
      });
    if (await refreshing) return api(path, method, body, false);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Request failed (${response.status})`);
  }
  return response.json();
}
export function useData<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    try {
      setError('');
      setData(await api<T>(path));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load');
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);
  return { data, error, loading, reload };
}
export async function download(id: string) {
  const response = await fetch(apiBase + `/evidence/${id}/content`, { credentials: 'include' });
  if (!response.ok) throw new Error('Evidence download denied or unavailable');
  const url = URL.createObjectURL(await response.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = 'evidence';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
