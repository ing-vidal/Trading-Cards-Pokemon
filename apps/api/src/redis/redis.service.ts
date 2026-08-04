import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log('Conexión con Redis establecida exitosamente.');
    });

    this.client.on('error', (err) => {
      this.logger.error('Error en Redis Client:', err.message);
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`No se pudo conectar a Redis en ${redisUrl}: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Conexión con Redis cerrada.');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.warn(`Error al guardar en Redis (${key}): ${err}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.warn(`Error al eliminar de Redis (${key}): ${err}`);
    }
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }
}
