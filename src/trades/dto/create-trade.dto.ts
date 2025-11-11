import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min
} from 'class-validator';
import { TradeSide } from '../schemas/trade.schema';

enum TradeStatusDto {
  PLANNED = 'PLANNED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export class CreateTradeDto {
  @IsString()
  symbol!: string;

  @IsEnum(TradeSide)
  side!: TradeSide;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsString()
  setupId?: string;

  @IsNumber()
  entry!: number;

  @IsNumber()
  sl!: number;

  @IsNumber()
  tp!: number;

  @IsNumber()
  @Min(0.5)
  rr!: number;

  @IsOptional()
  @IsNumber()
  maxDurationMin?: number;

  @IsOptional()
  @IsNumber()
  positionSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  riskPct?: number;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsNumber()
  emotionPre?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateTradeDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  entry?: number;

  @IsOptional()
  @IsNumber()
  sl?: number;

  @IsOptional()
  @IsNumber()
  tp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  rr?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class QueryTradesDto {
  @IsOptional()
  @IsEnum(TradeStatusDto)
  status?: TradeStatusDto;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  size?: number;
}
