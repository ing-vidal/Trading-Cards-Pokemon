import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { CategoriesModule } from './categories/categories.module';
import { RaritiesModule } from './rarities/rarities.module';
import { CardsModule } from './cards/cards.module';
import { PresetsModule } from './presets/presets.module';
import { StorageModule } from './storage/storage.module';
import { AssetsModule } from './assets/assets.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    CollectionsModule,
    CategoriesModule,
    RaritiesModule,
    CardsModule,
    PresetsModule,
    StorageModule,
    AssetsModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
