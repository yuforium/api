import { Module } from '@nestjs/common';
import { TopicController } from './controllers/topic.controller';

@Module({
  imports: [],
  controllers: [TopicController],
  providers: [],
  exports: []
})
export class TopicModule {}
