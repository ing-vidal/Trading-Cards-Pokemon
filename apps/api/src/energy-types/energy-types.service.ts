import { Injectable } from '@nestjs/common';
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
