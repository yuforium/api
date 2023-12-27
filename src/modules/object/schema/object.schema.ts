import { Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ObjectDto } from '../../../common/dto/object/object.dto';
import { BaseObjectSchema } from './base-object.schema';
import { GConstructor } from '../../../common/schema/base.schema';

export type ObjectDocument = ObjectRecord & mongoose.Document;

/**
 * Extends the Object DTO and adds additional database fields by extending BaseObjectSchema.
 */
@Schema({collection: 'objects', autoIndex: true})
export class ObjectRecord extends BaseObjectSchema<GConstructor<ObjectDto>>(ObjectDto) { }

export const ObjectSchema = SchemaFactory.createForClass(ObjectRecord);
