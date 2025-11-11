import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RiskPolicyDocument = RiskPolicy & Document;

@Schema({ timestamps: true, collection: 'risk_policies' })
export class RiskPolicy {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ default: 1 })
  maxRiskPerTradePct!: number;

  @Prop({ default: 3 })
  maxDailyLossPct!: number;

  @Prop({ default: 3 })
  maxConsecutiveLosses!: number;

  @Prop({ default: 1440 })
  maxTradeDurationMin!: number;

  @Prop({ default: '' })
  notes!: string;
}

export const RiskPolicySchema = SchemaFactory.createForClass(RiskPolicy);
