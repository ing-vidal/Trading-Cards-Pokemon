import { IsOptional, IsNumber, IsInt, IsEnum, IsString, Min } from 'class-validator';
import { ProductCondition, ProductStatus } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
