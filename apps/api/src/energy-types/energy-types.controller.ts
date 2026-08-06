import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EnergyTypesService } from './energy-types.service';

@Controller('energy-types')
export class EnergyTypesController {
  constructor(private readonly energyTypesService: EnergyTypesService) {}

  @Get()
  async findAll() {
    return this.energyTypesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.energyTypesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: { name: string; slug?: string; icon?: string; color?: string }) {
    return this.energyTypesService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: { name?: string; slug?: string; icon?: string; color?: string },
  ) {
    return this.energyTypesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.energyTypesService.remove(id);
  }
}
