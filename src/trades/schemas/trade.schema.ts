import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TradeDocument = Trade & Document;

export type TradeStatus = 'PLANNED' | 'OPEN' | 'CLOSED' | 'CANCELLED';
export type TradeSide = 'LONG' | 'SHORT';

export type TradeEventType = 'ENTRY' | 'ADD' | 'REDUCE' | 'MOVE_SL' | 'MOVE_TP' | 'EXIT' | 'NOTE';

@Schema({ _id: false })
export class TradePlan {
  @Prop({ required: true })
  entry!: number;

  @Prop({ required: true })
  sl!: number;

  @Prop({ required: true })
  tp!: number;

  @Prop({ required: true, min: 0.5 })
  rr!: number;

  @Prop()
  maxDurationMin?: number;

  @Prop()
  positionSize?: number;

  @Prop()
  riskPct?: number;

  @Prop()
  context?: string;

  @Prop()
  emotionPre?: number;

  @Prop({ type: [String], default: [] })
  tags?: string[];
}

@Schema({ _id: false })
export class TradeEvent {
  @Prop({ required: true })
  type!: TradeEventType;

  @Prop()
  price?: number;

  @Prop()
  qty?: number;

  @Prop()
  time?: Date;

  @Prop({ type: Object })
  payload?: Record<string, unknown>;
}

@Schema({ _id: false })
export class TradeExecution {
  @Prop()
  entryPrice?: number;

  @Prop()
  entryTime?: Date;

  @Prop()
  exitPrice?: number;

  @Prop()
  exitTime?: Date;

  @Prop({ type: [TradeEvent], default: [] })
  events!: TradeEvent[];
}

@Schema({ _id: false })
export class TradeAnalytics {
  @Prop()
  pnlValue?: number;

  @Prop()
  pnlPct?: number;

  @Prop()
  rMultiple?: number;

  @Prop()
  followedPlan?: boolean;

  @Prop()
  timeElapsedMin?: number;
}

@Schema({ timestamps: true, collection: 'trades' })
export class Trade {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  accountId?: Types.ObjectId;

  @Prop({ required: true })
  symbol!: string;

  @Prop({ required: true, enum: ['LONG', 'SHORT'] })
  side!: TradeSide;

  @Prop()
  timeframe?: string;

  @Prop({ type: Types.ObjectId })
  setupId?: Types.ObjectId;

  @Prop({ type: TradePlan, required: true })
  plan!: TradePlan;

  @Prop({ type: TradeExecution, default: {} })
  execution!: TradeExecution;

  @Prop({ type: TradeAnalytics, default: {} })
  analytics!: TradeAnalytics;

  @Prop({ type: String, enum: ['PLANNED', 'OPEN', 'CLOSED', 'CANCELLED'], default: 'PLANNED' })
  status!: TradeStatus;
}

export const TradeSchema = SchemaFactory.createForClass(Trade);

TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ userId: 1, status: 1, 'execution.entryTime': -1 });
TradeSchema.index({ userId: 1, symbol: 1, 'execution.entryTime': -1 });
TradeSchema.index({ userId: 1, 'plan.tags': 1 });
