import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function useApi() {
  const { token } = useAuth();

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || response.statusText);
    }
    if (response.status === 204) {
      return {} as T;
    }
    const data = (await response.json()) as T;
    return data;
  }

  return { request };
}
