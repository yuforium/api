import { Prop } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import * as mongoose from 'mongoose';
import { BaseRecord, BaseSchema, GConstructor } from 'src/common/schema/base.schema';
import { Activity } from '@yuforium/activity-streams';

type BaseActivityRecord = BaseRecord & {
  _object?: mongoose.Schema.Types.ObjectId;
};

/**
 * Adds Activity specific record meta to a schema class
 * @param SourceDto 
 * @returns 
 */
export function BaseActivitySchema<TBase extends GConstructor<Activity & {id: string}>>(SourceDto: TBase): TBase & GConstructor<BaseActivityRecord> {
  class BaseActivitySchema extends BaseSchema<typeof SourceDto>(SourceDto) implements BaseActivityRecord {
    @Exclude()
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'objects'})
    public _object?: mongoose.Schema.Types.ObjectId;
  }
  
  return BaseActivitySchema;
}