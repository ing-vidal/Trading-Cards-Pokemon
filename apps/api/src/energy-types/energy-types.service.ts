import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnergyTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.energyType.findMany({
      include: {
        _count: { select: { cards: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const energyType = await this.prisma.energyType.findUnique({
      where: { id },
      include: { _count: { select: { cards: true } } },
    });
    if (!energyType) throw new NotFoundException(`Tipo de energía '${id}' no encontrado`);
    return energyType;
  }

  async create(dto: { name: string; slug?: string; icon?: string; color?: string }) {
    const slug = dto.slug || dto.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return this.prisma.energyType.create({
      data: { name: dto.name, slug, icon: dto.icon, color: dto.color },
    });
  }

  async update(id: string, dto: { name?: string; slug?: string; icon?: string; color?: string }) {
    await this.findOne(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    return this.prisma.energyType.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.energyType.delete({ where: { id } });
    return { message: 'Tipo de energía eliminado exitosamente' };
  }

  async upsertMany(types: { name: string; slug: string; icon?: string; color?: string }[]) {
    const results = [];
    for (const t of types) {
      const result = await this.prisma.energyType.upsert({
        where: { slug: t.slug },
        update: { name: t.name, icon: t.icon, color: t.color },
        create: { name: t.name, slug: t.slug, icon: t.icon, color: t.color },
      });
      results.push(result);
    }
    return results;
  }
}
