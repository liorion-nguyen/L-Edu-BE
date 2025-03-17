import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from './config/skip.auth';

@Controller()
export class AppController {
  @Get('/')
  @SkipAuth()
  getHome(): string {
    return 'Welcome to L Edu API 🚀';
  }

  @Get('/health')
  @SkipAuth()
  healthCheck(): object {
    return { status: 'ok', timestamp: new Date() };
  }
}