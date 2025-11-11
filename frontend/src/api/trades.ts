import client from './client';

export interface TradePayload {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  planned_entry: number;
  planned_sl: number;
  planned_tp: number;
  planned_time_limit_minutes?: number;
  planned_reason?: string;
  planned_emotion?: string;
  planned_tags?: string;
  quantity?: number;
  account_id?: number;
  setup_id?: number;
  tag_ids?: number[];
  attachments?: { url: string; description?: string }[];
}

export async function fetchTrades(params?: Record<string, unknown>) {
  const { data } = await client.get('/trades/', { params });
  return data;
}

export async function createTrade(payload: TradePayload) {
  const { data } = await client.post('/trades/', payload);
  return data;
}

export async function fetchTrade(id: string) {
  const { data } = await client.get(`/trades/${id}`);
  return data;
}

export async function addEvent(tradeId: string | number, payload: { type: string; price?: number; quantity?: number; note?: string; occurred_at?: string }) {
  const { data } = await client.post(`/trades/${tradeId}/events`, payload);
  return data;
}

export async function fetchOverview() {
  const { data } = await client.get('/reports/overview');
  return data;
}

export async function fetchDeviations() {
  const { data } = await client.get('/reports/deviations');
  return data;
}

export async function fetchRiskAlerts() {
  const { data } = await client.get('/reports/risk-alerts');
  return data;
}
