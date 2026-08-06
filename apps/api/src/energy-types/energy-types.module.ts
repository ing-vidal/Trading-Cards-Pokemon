import { Module } from '@nestjs/common';
import { EnergyTypesController } from './energy-types.controller';
import { EnergyTypesService } from './energy-types.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EnergyTypesController],
  providers: [EnergyTypesService],
  exports: [EnergyTypesService],
})
export class EnergyTypesModule {}
