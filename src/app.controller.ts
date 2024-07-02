import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiProduces } from '@nestjs/swagger';
import { ServiceDomain } from './common/decorators/service-domain.decorator';

@ApiProduces('application/ld+json; profile="https://www.w3.org/ns/activitystreams"', 'application/activity+json')
@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    protected readonly appService: AppService
  ) { }

  @Get()
  public async getService(@ServiceDomain() serviceId: string) {
    return this.appService.get(serviceId);
  }

  @Get('healthz')
  public async getHealthCheck(): Promise<{status: string, uptime: number, timestamp: number}> {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }
}
