import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardFilterDto } from './dto/card-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  async findAll(@Query() filters: CardFilterDto) {
    return this.cardsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }
}
