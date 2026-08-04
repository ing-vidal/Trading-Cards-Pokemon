import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async checkGeneralHealth() {
    return {
      status: 'ok',
      service: 'TCG Vision API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('db')
  async checkDatabaseHealth() {
    const isDbConnected = await this.prismaService.ping();
    return {
      service: 'PostgreSQL Database',
      status: isDbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('redis')
  async checkRedisHealth() {
    const isRedisConnected = await this.redisService.ping();
    return {
      service: 'Redis Cache',
      status: isRedisConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}
