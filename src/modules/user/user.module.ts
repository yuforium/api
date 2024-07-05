import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './controller/user.controller';
import { UserInboxController } from './controller/user-inbox.controller';
import { UserOutboxController } from './controller/user-outbox.controller';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';
import { UserContentController } from './controller/user-content.controller';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    ObjectModule,
    ActivityModule,
    ActivityModule
  ],
  controllers: [
    UserOutboxController,
    UserInboxController,
    UserContentController,
    UserController
  ]
})
export class UserModule { }
