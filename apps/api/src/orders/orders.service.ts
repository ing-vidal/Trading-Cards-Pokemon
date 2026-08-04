import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El pedido debe incluir al menos un producto');
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData: Array<{ productId: string; quantity: number; price: number }> = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { card: true },
        });

        if (!product) {
          throw new NotFoundException(`Producto '${item.productId}' no encontrado`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para '${product.card.name}' (${product.condition}). Solicitado: ${item.quantity}, Disponible: ${product.stock}`
          );
        }

        const newStock = product.stock - item.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: newStock,
            status: newStock === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
          },
        });

        const itemTotal = Number(product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: Number(product.price),
        });
      }

      return tx.order.create({
        data: {
          userId,
          total: totalAmount,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: { card: true },
              },
            },
          },
        },
      });
    });
  }

  async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { card: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: {
          include: {
            product: {
              include: { card: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido '${id}' no encontrado`);
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: true },
    });
  }
}
