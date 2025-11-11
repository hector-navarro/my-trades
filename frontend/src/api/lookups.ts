import client from './client';

export async function fetchSetups() {
  const { data } = await client.get('/setups/');
  return data;
}

export async function createSetup(payload: { name: string; description?: string }) {
  const { data } = await client.post('/setups/', payload);
  return data;
}

export async function deleteSetup(id: number) {
  await client.delete(`/setups/${id}`);
}

export async function fetchTags() {
  const { data } = await client.get('/tags/');
  return data;
}

export async function createTag(payload: { name: string; color?: string }) {
  const { data } = await client.post('/tags/', payload);
  return data;
}

export async function deleteTag(id: number) {
  await client.delete(`/tags/${id}`);
}

export async function fetchRiskPolicy() {
  const { data } = await client.get('/risk/policy');
  return data;
}

export async function upsertRiskPolicy(payload: Record<string, unknown>) {
  const { data } = await client.post('/risk/policy', payload);
  return data;
}
