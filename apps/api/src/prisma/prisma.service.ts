import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexión con PostgreSQL (Prisma) establecida exitosamente.');
    } catch (error) {
      this.logger.error('Error al conectar con PostgreSQL:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Conexión con PostgreSQL (Prisma) cerrada.');
  }

  async ping(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }
}
