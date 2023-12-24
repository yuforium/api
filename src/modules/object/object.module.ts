import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectService } from './object.service';
import { ObjectRecordDto, ObjectSchema } from './schema/object.schema';
import { ObjectController } from './object.controller';
import { ActivityModule } from '../activity/activity.module';
import { RelationshipRecordDto, RelationshipSchema } from './schema/relationship.schema';
import { ActorRecord, ActorSchema } from './schema/actor.schema';

@Module({
  providers: [ObjectService],
  imports: [
    MongooseModule.forFeature([
      {name: ObjectRecordDto.name, schema: ObjectSchema},
      {name: RelationshipRecordDto.name, schema: RelationshipSchema},
      {name: ActorRecord.name, schema: ActorSchema}
    ]),
    ActivityModule
  ],
  exports: [
    ObjectService,
    MongooseModule
  ],
  controllers: [ObjectController]
})
export class ObjectModule {}
