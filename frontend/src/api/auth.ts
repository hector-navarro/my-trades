import client from './client';

export async function login(email: string, password: string) {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const { data } = await client.post('/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return data;
}

export async function signup(payload: { email: string; password: string; full_name?: string }) {
  const { data } = await client.post('/auth/signup', payload);
  return data;
}
