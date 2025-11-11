import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  port!: number;

  @IsString()
  MONGODB_URI!: string;

  @IsOptional()
  @IsString()
  MONGODB_DB?: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_EXPIRES?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
