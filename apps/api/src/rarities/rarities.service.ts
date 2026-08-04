import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRarityDto } from './dto/create-rarity.dto';
import { UpdateRarityDto } from './dto/update-rarity.dto';

@Injectable()
export class RaritiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rarity.findMany({
      include: {
        preset: true,
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { name: 'asc' },
    });
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
