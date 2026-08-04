import { IsOptional, IsString, IsEnum } from 'class-validator';
import { RarityLevel } from '@prisma/client';

export class UpdateRarityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RarityLevel)
  level?: RarityLevel;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  presetId?: string;
}
