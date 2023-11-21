import { Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { ObjectDto } from "../../../common/dto/object/object.dto";
import { BaseObjectSchema, GConstructor } from "./base-object.schema";

export type ObjectDocument = ObjectRecordDto & mongoose.Document;

/**
 * Extends the Object DTO and adds additional database fields by extending BaseObjectSchema.
 */
@Schema({collection: 'objects', autoIndex: true})
export class ObjectRecordDto extends BaseObjectSchema<GConstructor<ObjectDto>>(ObjectDto) {
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectRecordDto);
