import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ActivityPubModule } from '../activity-pub/activity-pub.module';
import { UserInboxController } from './user-inbox.controller';
import { UserOutboxController } from './user-outbox.controller';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    ObjectModule,
    ActivityPubModule,
    ActivityModule
  ],
  controllers: [
    UserOutboxController,
    UserInboxController,
    UserController
  ]
})
export class UserModule { }
