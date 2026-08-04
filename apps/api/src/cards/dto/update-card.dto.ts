import { IsOptional, IsString, IsInt, IsEnum, IsArray } from 'class-validator';
import { CardStatus } from '@prisma/client';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  game?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  hp?: number;

  @IsOptional()
  @IsInt()
  attack?: number;

  @IsOptional()
  @IsInt()
  defense?: number;

  @IsOptional()
  @IsArray()
  abilities?: any[];

  @IsOptional()
  @IsEnum(CardStatus)
  status?: CardStatus;

  @IsOptional()
  @IsString()
  collectionId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  rarityId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  stock?: number;
}

