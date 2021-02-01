import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';

@Module({
  providers: [InboxService],
  controllers: [InboxController]
})
export class InboxModule {}
