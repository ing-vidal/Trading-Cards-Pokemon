import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { AssetType } from '@prisma/client';

export class CreateAssetDto {
  @IsNotEmpty({ message: 'El nombre del asset es obligatorio' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'El tipo de asset es obligatorio' })
  @IsEnum(AssetType, { message: 'El tipo de asset no es válido' })
  type: AssetType;

  @IsOptional()
  @IsString()
  cardId?: string;

  @IsOptional()
  @IsString()
  version?: string = '1.0.0';
}
