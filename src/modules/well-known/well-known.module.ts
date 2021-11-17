import { Module } from '@nestjs/common';
import { ActivityPubModule } from '../activity-pub/activity-pub.module';
import { WebfingerController } from './webfinger.controller';
import { WebfingerService } from './webfinger.service';

@Module({
  controllers: [WebfingerController],
  providers: [WebfingerService],
  imports: [ActivityPubModule]
})
export class WellKnownModule {}
