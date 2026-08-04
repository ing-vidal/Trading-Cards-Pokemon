import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardFilterDto } from './dto/card-filter.dto';
import { Prisma, AssetType, ProductCondition, ProductStatus } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: CardFilterDto) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.CardWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { number: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.collectionId) where.collectionId = filters.collectionId;
    if (filters.rarityId) where.rarityId = filters.rarityId;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.status) where.status = filters.status;

    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        skip,
        take: limit,
        include: {
          collection: true,
          rarity: { include: { preset: true } },
          category: true,
          assets: true,
          products: {
            take: 5,
            select: { id: true, condition: true, price: true, stock: true, status: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.card.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: cards,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const card = await this.prisma.card.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        collection: true,
        rarity: { include: { preset: true } },
        category: true,
        assets: true,
        effects: { include: { preset: true } },
        products: true,
      },
    });

    if (!card) {
      throw new NotFoundException(`Carta '${id}' no encontrada`);
    }

    return card;
  }

  async create(dto: CreateCardDto) {
    const baseSlug = (dto.slug || dto.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Resolve or fallback Collection, Rarity, Category
    let collectionId = dto.collectionId;
    if (!collectionId) {
      const col = await this.prisma.collection.findFirst();
      collectionId = col?.id || '';
    }

    let rarityId = dto.rarityId;
    if (!rarityId) {
      const rar = await this.prisma.rarity.findFirst();
      rarityId = rar?.id || '';
    }

    const card = await this.prisma.card.create({
      data: {
        name: dto.name,
        slug,
        number: dto.number,
        game: dto.game || 'Pokemon TCG',
        language: dto.language || 'English',
        description: dto.description || `Carta de ${dto.name}`,
        hp: dto.hp || 100,
        status: dto.status || 'PUBLISHED',
        collectionId,
        rarityId,
        categoryId: dto.categoryId,
      },
      include: {
        collection: true,
        rarity: true,
        category: true,
        assets: true,
        products: true,
      },
    });

    // Create Image Asset if provided
    if (dto.imageUrl) {
      await this.prisma.asset.create({
        data: {
          name: `${dto.name} Artwork`,
          type: AssetType.IMAGE,
          url: dto.imageUrl,
          size: dto.imageUrl.length,
          format: 'png',
          cardId: card.id,
        },
      });
    }

    // Create Default Product Listing if price provided
    if (dto.price) {
      await this.prisma.product.create({
        data: {
          cardId: card.id,
          sku: `SKU-${slug.toUpperCase()}`,
          condition: ProductCondition.NEAR_MINT,
          price: dto.price,
          stock: dto.stock ?? 10,
          status: ProductStatus.AVAILABLE,
        },
      });
    }

    return this.findOne(card.id);
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    const dataToUpdate: any = {};
    if (dto.name) dataToUpdate.name = dto.name;
    if (dto.number) dataToUpdate.number = dto.number;
    if (dto.hp !== undefined) dataToUpdate.hp = dto.hp;
    if (dto.status) dataToUpdate.status = dto.status;
    if (dto.collectionId) dataToUpdate.collectionId = dto.collectionId;
    if (dto.rarityId) dataToUpdate.rarityId = dto.rarityId;
    if (dto.description) dataToUpdate.description = dto.description;

    const card = await this.prisma.card.update({
      where: { id },
      data: dataToUpdate,
    });

    if (dto.imageUrl) {
      const existingAsset = await this.prisma.asset.findFirst({ where: { cardId: id } });
      if (existingAsset) {
        await this.prisma.asset.update({
          where: { id: existingAsset.id },
          data: { url: dto.imageUrl },
        });
      } else {
        await this.prisma.asset.create({
          data: {
            name: `${card.name} Artwork`,
            type: AssetType.IMAGE,
            url: dto.imageUrl,
            size: dto.imageUrl.length,
            format: 'png',
            cardId: card.id,
          },
        });
      }
    }

    if (dto.price !== undefined || dto.stock !== undefined) {
      const existingProduct = await this.prisma.product.findFirst({ where: { cardId: id } });
      const productData: any = {};
      if (dto.price !== undefined) productData.price = dto.price;
      if (dto.stock !== undefined) {
        productData.stock = dto.stock;
        productData.status = dto.stock > 0 ? ProductStatus.AVAILABLE : ProductStatus.OUT_OF_STOCK;
      }

      if (existingProduct) {
        await this.prisma.product.update({
          where: { id: existingProduct.id },
          data: productData,
        });
      } else {
        await this.prisma.product.create({
          data: {
            cardId: card.id,
            sku: `SKU-${card.slug.toUpperCase()}`,
            condition: ProductCondition.NEAR_MINT,
            price: dto.price ?? 49.99,
            stock: dto.stock ?? 10,
            status: (dto.stock ?? 10) > 0 ? ProductStatus.AVAILABLE : ProductStatus.OUT_OF_STOCK,
          },
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.asset.deleteMany({ where: { cardId: id } });
    await this.prisma.product.deleteMany({ where: { cardId: id } });
    await this.prisma.cardEffect.deleteMany({ where: { cardId: id } });
    await this.prisma.card.delete({ where: { id } });
    return { message: 'Carta eliminada exitosamente' };
  }
}
