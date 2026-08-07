import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redis.get('collections:all');
    if (cached) {
      return JSON.parse(cached);
    }

    const collections = await this.prisma.collection.findMany({
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { releaseDate: 'desc' },
    });

    await this.redis.set('collections:all', JSON.stringify(collections), 3600); // 1 hora
    return collections;
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        OR: [{ id }, { slug: id }, { code: id }],
      },
      include: {
        cards: {
          take: 20,
          include: { rarity: true, assets: true },
        },
        _count: {
          select: { cards: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Colección '${id}' no encontrada`);
    }

    return collection;
  }

  async create(dto: CreateCollectionDto) {
    const slug = (dto.slug || dto.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await this.prisma.collection.findFirst({
      where: {
        OR: [{ slug }, { code: dto.code }],
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe una colección con ese slug o código');
    }

    const collection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        slug,
        code: dto.code.toUpperCase(),
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : null,
        logo: dto.logo || dto.images?.[0],
        description: dto.description,
      },
    });

    await this.redis.del('collections:all');
    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto) {
    await this.findOne(id);

    const updated = await this.prisma.collection.update({
      where: { id },
      data: {
        ...dto,
        logo: dto.logo ?? dto.images?.[0],
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
      },
    });

    await this.redis.del('collections:all');
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.collection.delete({ where: { id } });
    await this.redis.del('collections:all');
    return { message: 'Colección eliminada exitosamente' };
  }
}
