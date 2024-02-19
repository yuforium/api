import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectService } from './object.service';
import { ObjectRecord, ObjectSchema } from './schema/object.schema';
import { ObjectController } from './object.controller';
import { RelationshipRecord, RelationshipSchema } from './schema/relationship.schema';
import { ActorRecord, ActorSchema } from './schema/actor.schema';

@Module({
  providers: [ObjectService],
  imports: [
    MongooseModule.forFeature([
      { name: ObjectRecord.name, schema: ObjectSchema },
      { name: RelationshipRecord.name, schema: RelationshipSchema },
      { name: ActorRecord.name, schema: ActorSchema }
    ])
  ],
  exports: [
    ObjectService,
    MongooseModule
  ],
  controllers: [ObjectController]
})
export class ObjectModule { }
