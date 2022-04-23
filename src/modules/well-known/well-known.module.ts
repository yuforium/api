import { Module } from '@nestjs/common';
import { ObjectModule } from '../object/object.module';
import { WebfingerController } from './webfinger.controller';
import { WebfingerService } from './webfinger.service';

@Module({
  controllers: [WebfingerController],
  providers: [WebfingerService],
  imports: [ObjectModule]
})
export class WellKnownModule {}
