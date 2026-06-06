import Constants from 'expo-constants';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './token-storage';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
export const API_URL = extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (response.status === 401 && retry) {
    const refresh = await getRefreshToken();
    if (refresh) {
      const refreshed = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        await saveTokens(data.access, refresh);
        return request<T>(path, init, false);
      }
    }
    await clearTokens();
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body || {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
