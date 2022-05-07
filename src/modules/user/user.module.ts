import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './controllers/user.controller';
import { InboxController } from './controllers/inbox.controller';
import { OutboxController } from './controllers/outbox.controller';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    ObjectModule,
    ActivityModule
  ],
  controllers: [
    OutboxController,
    InboxController,
    UserController
  ]
})
export class UserModule { }
