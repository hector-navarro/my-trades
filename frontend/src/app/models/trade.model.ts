export interface TradePlan {
  entry: number;
  sl: number;
  tp: number;
  rr: number;
  maxDurationMin?: number;
  positionSize?: number;
  riskPct?: number;
  context?: string;
  emotionPre?: number;
  tags?: string[];
}

export interface TradeEvent {
  type: string;
  price?: number;
  qty?: number;
  time?: string;
  payload?: Record<string, any>;
}

export interface TradeAnalytics {
  rMultiple?: number;
  followedPlan?: boolean;
  timeElapsedMin?: number;
}

export interface Trade {
  _id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  plan: TradePlan;
  execution: {
    entryPrice?: number;
    exitPrice?: number;
    events: TradeEvent[];
  };
  analytics: TradeAnalytics;
  status: string;
}
