import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RaritiesService } from './rarities.service';
import { CreateRarityDto } from './dto/create-rarity.dto';
import { UpdateRarityDto } from './dto/update-rarity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@Controller('rarities')
export class RaritiesController {
  constructor(private readonly raritiesService: RaritiesService) {}

  @Get()
  async findAll() {
    return this.raritiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.raritiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.DESIGNER)
  @Post()
  async create(@Body() dto: CreateRarityDto) {
    return this.raritiesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.DESIGNER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRarityDto) {
    return this.raritiesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.raritiesService.remove(id);
  }
}
