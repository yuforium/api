import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './controllers/user.controller';
import { UserInboxController } from './controllers/user-inbox.controller';
import { UserOutboxController } from './controllers/user-outbox.controller';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';
import { UserContentController } from './controllers/user-content.controller';
import { ActivityStreamModule } from '../activity-stream/activity-stream.module';
import { ActivityPubModule } from '../activity-pub/activity-pub.module';
import { PersonRecordDto, PersonSchema } from '../object/schema/person.schema';
import { DispatchService } from '../activity-pub/services/dispatch.service';
import { UserActorRecordDto, UserActorSchema } from './schemas/user-actor.schema';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    MongooseModule.forFeature([{name: PersonRecordDto.name, schema: PersonSchema}]),
    MongooseModule.forFeature([{name: UserActorRecordDto.name, schema: UserActorSchema}]),
    ObjectModule,
    ActivityModule,
    ActivityStreamModule,
    ActivityPubModule,
    forwardRef(() => ActivityPubModule)
  ],
  controllers: [
    UserOutboxController,
    UserInboxController,
    UserContentController,
    UserController
  ]
})
export class UserModule { }
