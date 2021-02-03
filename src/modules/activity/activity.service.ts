import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';

@Injectable()
export class ActivityService {
	constructor(@InjectModel(Activity.name) protected activityModel: Model<ActivityDocument>) { }
	
	public async create(params: any) {
		return this.activityModel.create(params);
	}

	// process an external message
	public async process(activity: any) {

	}
}
