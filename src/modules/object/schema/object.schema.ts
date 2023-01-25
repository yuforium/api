import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import * as mongoose from 'mongoose';
import { ObjectDto } from "../../../common/dto/object/object.dto";
import { BaseObjectSchema, GConstructor } from "./base-object.schema";

export type ObjectDocument = ObjectRecordDto & mongoose.Document;

/**
 * DTO for an Object record, which extends the Object DTO and adds any additional fields that are specific to the database record.
 */
@Schema({collection: 'objects', autoIndex: true})
export class ObjectRecordDto extends BaseObjectSchema<GConstructor<ObjectDto>>(ObjectDto) {
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectRecordDto);

ObjectSchema.pre('find', () => {
    console.log(this);
});