import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ObjectDto } from '../../../common/dto/object/object.dto';
import { BaseObjectSchema } from './base-object.schema';
import { GConstructor } from '../../../common/schema/base.schema';
import { ObjectType } from '../type/object.type';
import { Exclude } from 'class-transformer';

/**
 * ObjectDocument is a type that extends the ObjectRecord and adds the mongoose.Document type,
 * representing a document in the database.
 */
export type ObjectDocument = ObjectRecord & mongoose.Document;

/**
 * Extends the Object DTO and adds additional database fields by extending BaseObjectSchema.
 */
@Schema({collection: 'objects', autoIndex: true, discriminatorKey: '_baseType'})
export class ObjectRecord extends BaseObjectSchema<GConstructor<ObjectType>>(ObjectDto) {
  // @Prop({type: String, required: false})
  // public preferredUsername?: string;
  /**
   * Base Type of the object.  This is used by the Object model's discriminator.
   */
  @Prop({type: String, required: false})
  @Exclude()
  public _baseType?: 'actor' | 'object';
}
export const ObjectSchema = SchemaFactory.createForClass(ObjectRecord);
