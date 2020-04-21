import { Module } from '@nestjs/common';
import { ServiceController } from './controllers/service.controller';

@Module({
  controllers: [ServiceController]
})
export class ServiceModule {}
