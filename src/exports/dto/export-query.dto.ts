import { IsOptional, IsString } from 'class-validator';

export class ExportQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
