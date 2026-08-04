import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { RarityLevel } from '@prisma/client';

export class CreateRarityDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'El nivel de rareza es obligatorio' })
  @IsEnum(RarityLevel, { message: 'El nivel de rareza no es válido' })
  level: RarityLevel;

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
