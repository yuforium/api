import { Module } from '@nestjs/common';
import { InboxController } from './inbox/inbox.controller';

@Module({
  controllers: [InboxController]
})
export class SiteModule {}
