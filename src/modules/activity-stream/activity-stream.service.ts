import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schema/activity.schema';
import { BaseObject, BaseObjectDocument } from './schema/base-object.schema';

@Injectable()
export class ActivityStreamService {
	constructor(
		@InjectModel(BaseObject.name) protected objectModel: Model<BaseObjectDocument>,
		@InjectModel(Activity.name) protected activityModel: Model<ActivityDocument>
	) { }

	public async createObject(data): Promise<BaseObjectDocument> {
		return this.objectModel.create(data);
	}

	public createActivity(data): Promise<ActivityDocument> {
		return this.activityModel.create(data);
	}
}
