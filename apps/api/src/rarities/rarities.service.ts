import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRarityDto } from './dto/create-rarity.dto';
import { UpdateRarityDto } from './dto/update-rarity.dto';

const LEVEL_ORDER: Record<string, number> = {
  COMMON: 0, UNCOMMON: 1, RARE: 2, DOUBLE_RARE: 3,
  STAR_1: 4, STAR_2: 5, STAR_3: 6,
  IMMERSIVE: 7, DOUBLE_IMMERSIVE: 8, CROWN: 9, PROMO: 10,
};

@Injectable()
export class RaritiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rarities = await this.prisma.rarity.findMany({
      include: {
        preset: true,
        _count: { select: { cards: true } },
      },
    });
    return rarities.sort((a, b) =>
      (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99),
    );
  }

  async findOne(id: string) {
    const rarity = await this.prisma.rarity.findUnique({
      where: { id },
      include: {
        preset: true,
        _count: { select: { cards: true } },
      },
    });

    if (!rarity) {
      throw new NotFoundException(`Rareza '${id}' no encontrada`);
    }

    return rarity;
  }

  async create(dto: CreateRarityDto) {
    const existing = await this.prisma.rarity.findUnique({
      where: { level: dto.level },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una rareza configurada para el nivel ${dto.level}`);
    }

    return this.prisma.rarity.create({
      data: {
        name: dto.name,
        level: dto.level,
        icon: dto.icon,
        color: dto.color,
        presetId: dto.presetId,
      },
      include: { preset: true },
    });
  }

  async update(id: string, dto: UpdateRarityDto) {
    await this.findOne(id);
    return this.prisma.rarity.update({
      where: { id },
      data: dto,
      include: { preset: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.rarity.delete({ where: { id } });
    return { message: 'Rareza eliminada exitosamente' };
  }
}
