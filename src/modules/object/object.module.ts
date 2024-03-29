import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectService } from './object.service';
import { ObjectRecord, ObjectSchema } from './schema/object.schema';
import { ObjectController } from './object.controller';
import { RelationshipRecord, RelationshipSchema } from './schema/relationship.schema';
import { ActorRecord, ActorSchema } from './schema/actor.schema';
import { StoredObjectResolver } from './resolver/stored-object.resolver';
import { UserActorRecord, UserActorSchema } from './schema/user-actor.schema';

@Module({
  providers: [ObjectService, StoredObjectResolver],
  imports: [
    MongooseModule.forFeature([
      { name: ObjectRecord.name, schema: ObjectSchema },
      { name: RelationshipRecord.name, schema: RelationshipSchema },
      { name: ActorRecord.name, schema: ActorSchema },
      { name: UserActorRecord.name, schema: UserActorSchema}
    ])
  ],
  exports: [
    ObjectService,
    MongooseModule,
    StoredObjectResolver
  ],
  controllers: [ObjectController]
})
export class ObjectModule { }
