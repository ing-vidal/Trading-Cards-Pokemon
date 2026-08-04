import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AssetType } from '@prisma/client';

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @IsOptional()
  @IsString()
  cardId?: string;

  @IsOptional()
  @IsString()
  version?: string;
}
