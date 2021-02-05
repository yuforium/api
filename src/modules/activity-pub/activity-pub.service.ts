import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schema/activity.schema';
import { BaseObject, BaseObjectDocument } from './schema/base-object.schema';
import { Person, PersonDocument } from './schema/person.schema';

@Injectable()
export class ActivityPubService {
  constructor(
    @InjectModel(BaseObject.name) protected objectModel: Model<BaseObjectDocument>,
    @InjectModel(Activity.name) protected activityModel: Model<ActivityDocument>,
    @InjectModel(Person.name) protected personModel: Model<PersonDocument>
  ) { }

  // @todo remove these methods in favor of one that dynamically injects the correct model based on the type provided
  public async createPerson(data): Promise<PersonDocument> {
    return this.personModel.create(data);
  }
  
  public async createObject(data): Promise<BaseObjectDocument> {
    return this.objectModel.create(data);
  }

  public async createActivity(data): Promise<ActivityDocument> {
    return this.activityModel.create(data);
  }

  public async find(params) {
    return this.activityModel.find(params);
  }

  public async findOne(params) {
    return this.activityModel.findOne(params);
  }
}
