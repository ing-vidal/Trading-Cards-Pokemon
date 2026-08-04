import { IsNotEmpty, IsArray, IsString, IsInt, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsString()
  productId: string;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Debe incluir al menos un ítem en la orden' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty({ message: 'La dirección de envío es obligatoria' })
  @IsString()
  shippingAddress: string;
}
