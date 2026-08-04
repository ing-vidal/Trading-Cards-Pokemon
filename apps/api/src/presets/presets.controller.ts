import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PresetsService } from './presets.service';
import { CreateVisualPresetDto } from './dto/create-preset.dto';
import { UpdateVisualPresetDto } from './dto/update-preset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@Controller('visual-presets')
export class PresetsController {
  constructor(private readonly presetsService: PresetsService) {}

  @Get()
  async findAll() {
    return this.presetsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.presetsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.DESIGNER)
  @Post()
  async create(@Body() dto: CreateVisualPresetDto) {
    return this.presetsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.DESIGNER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVisualPresetDto) {
    return this.presetsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.presetsService.remove(id);
  }
}
