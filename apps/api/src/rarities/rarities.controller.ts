import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RaritiesService } from './rarities.service';
import { CreateRarityDto } from './dto/create-rarity.dto';
import { UpdateRarityDto } from './dto/update-rarity.dto';

// Auth guards removed — admin operates without JWT for now
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

  @Post()
  async create(@Body() dto: CreateRarityDto) {
    return this.raritiesService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRarityDto) {
    return this.raritiesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.raritiesService.remove(id);
  }
}
