import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCondition, ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(cardId?: string, condition?: ProductCondition, status?: ProductStatus) {
    const where: any = {};
    if (cardId) where.cardId = cardId;
    if (condition) where.condition = condition;
    if (status) where.status = status;

    return this.prisma.product.findMany({
      where,
      include: {
        card: {
          include: { collection: true, rarity: true },
        },
      },
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        card: {
          include: { collection: true, rarity: true, assets: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto '${id}' no encontrado`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const card = await this.prisma.card.findUnique({ where: { id: dto.cardId } });
    if (!card) {
      throw new NotFoundException(`Carta '${dto.cardId}' no encontrada`);
    }

    const sku = dto.sku || `SKU-${card.slug.toUpperCase()}-${dto.condition}-${Date.now().toString().slice(-4)}`;

    return this.prisma.product.create({
      data: {
        cardId: dto.cardId,
        sku,
        condition: dto.condition,
        price: dto.price,
        stock: dto.stock,
        status: dto.status || ProductStatus.AVAILABLE,
      },
      include: { card: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.stock === 0) {
      data.status = ProductStatus.OUT_OF_STOCK;
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: { card: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Producto eliminado del marketplace exitosamente' };
  }
}
