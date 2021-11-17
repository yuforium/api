import { Module } from '@nestjs/common';
import { WebfingerController } from './webfinger.controller';

@Module({
  controllers: [WebfingerController]
})
export class WellKnownModule {}
