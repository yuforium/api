import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityPubService } from './activity-pub.service';
import { Activity, ActivitySchema } from './schema/activity.schema';
import { BaseObject, BaseObjectSchema } from './schema/base-object.schema';
import { Person, PersonSchema } from './schema/person.schema';

@Module({
  providers: [ActivityPubService],
  imports: [
    MongooseModule.forFeature([
      // {name: BaseObject.name, schema: BaseObjectSchema},
      // {name: Activity.name, schema: ActivitySchema},
      {name: Person.name, schema: PersonSchema}
    ])
  ],
  exports: [ActivityPubService, MongooseModule]
})
export class ActivityPubModule { }
