import { Controller, Get } from '@nestjs/common';
import { EnergyTypesService } from './energy-types.service';

@Controller('energy-types')
export class EnergyTypesController {
  constructor(private readonly energyTypesService: EnergyTypesService) {}

  @Get()
  async findAll() {
    return this.energyTypesService.findAll();
  }
}
