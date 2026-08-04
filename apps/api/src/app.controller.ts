import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return {
      message: 'TCG Vision API is running',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
