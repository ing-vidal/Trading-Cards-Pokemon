import { IsNotEmpty, IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'El estado del pedido es obligatorio' })
  @IsEnum(OrderStatus, { message: 'Estado de orden no válido' })
  status: OrderStatus;
}
