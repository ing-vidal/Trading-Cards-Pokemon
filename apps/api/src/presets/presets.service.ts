import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisualPresetDto } from './dto/create-preset.dto';
import { UpdateVisualPresetDto } from './dto/update-preset.dto';
import { ALL_PRESETS } from '@tcg/shaders';

@Injectable()
export class PresetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const dbPresets = await this.prisma.visualPreset.findMany({
      include: {
        _count: { select: { rarities: true, cardEffects: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      dbPresets,
      glslBuiltInPresets: ALL_PRESETS,
    };
  }

  async findOne(id: string) {
    const preset = await this.prisma.visualPreset.findUnique({
      where: { id },
      include: {
        rarities: true,
        cardEffects: true,
      },
    });

    if (!preset) {
      throw new NotFoundException(`Preset visual '${id}' no encontrado`);
    }

    return preset;
  }

  async create(dto: CreateVisualPresetDto) {
    return this.prisma.visualPreset.create({
      data: {
        name: dto.name,
        shader: dto.shader,
        material: dto.material,
        foil: dto.foil,
        particles: dto.particles,
        animation: dto.animation,
        intensity: dto.intensity ?? 50,
      },
    });
  }

  async update(id: string, dto: UpdateVisualPresetDto) {
    await this.findOne(id);
    return this.prisma.visualPreset.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.visualPreset.delete({ where: { id } });
    return { message: 'Preset visual eliminado exitosamente' };
  }
}
