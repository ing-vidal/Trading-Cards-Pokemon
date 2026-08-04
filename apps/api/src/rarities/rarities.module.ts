import { Module } from '@nestjs/common';
import { RaritiesService } from './rarities.service';
import { RaritiesController } from './rarities.controller';

@Module({
  controllers: [RaritiesController],
  providers: [RaritiesService],
  exports: [RaritiesService],
})
export class RaritiesModule {}
