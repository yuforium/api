import { Module } from '@nestjs/common';
import { ObjectModule } from '../object/object.module';
import { UserModule } from '../user/user.module';
import { WebfingerController } from './webfinger.controller';
import { WebfingerService } from './webfinger.service';
import { HostMetaController } from './host-meta.controller';

@Module({
  controllers: [WebfingerController, HostMetaController],
  providers: [WebfingerService],
  imports: [ObjectModule, UserModule]
})
export class WellKnownModule {}
