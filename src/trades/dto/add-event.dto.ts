import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { TradeEventType } from '../schemas/trade.schema';

export class AddTradeEventDto {
  @IsEnum(['ENTRY', 'ADD', 'REDUCE', 'MOVE_SL', 'MOVE_TP', 'EXIT', 'NOTE'])
  type!: TradeEventType;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
