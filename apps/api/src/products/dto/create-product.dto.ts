import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt, IsEnum, Min } from 'class-validator';
import { ProductCondition, ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El ID de la carta es obligatorio' })
  @IsString()
  cardId: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNotEmpty({ message: 'La condición de la carta es obligatoria' })
  @IsEnum(ProductCondition, { message: 'La condición del producto no es válida' })
  condition: ProductCondition;

  @IsNotEmpty({ message: 'El precio del producto es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @Min(0.01)
  price: number;

  @IsNotEmpty({ message: 'El stock disponible es obligatorio' })
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.AVAILABLE;
}
