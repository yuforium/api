import { Module } from '@nestjs/common';
import { OutboxController } from './outbox.controller';

@Module({
  controllers: [OutboxController]
})
export class OutboxModule {}
