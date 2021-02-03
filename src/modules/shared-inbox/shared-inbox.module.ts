import { Module } from '@nestjs/common';
import { SharedInboxController } from './shared-inbox.controller';

@Module({
  controllers: [SharedInboxController]
})
export class SharedInboxModule {}
