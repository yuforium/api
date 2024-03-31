import { Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { BaseActivitySchema } from './base-activity.schema';
import { GConstructor } from '../../../common/schema/base.schema';

export type ActivityDocument = ActivityRecord & mongoose.Document;

@Schema({collection: 'activities'})
export class ActivityRecord extends BaseActivitySchema<GConstructor<ActivityDto>>(ActivityDto) { }

export const ActivitySchema = SchemaFactory.createForClass(ActivityRecord);
