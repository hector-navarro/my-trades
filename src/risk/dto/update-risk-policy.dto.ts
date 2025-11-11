import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRiskPolicyDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxRiskPerTradePct?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxDailyLossPct?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxConsecutiveLosses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxTradeDurationMin?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
