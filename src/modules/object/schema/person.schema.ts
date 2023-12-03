import * as mongoose from "mongoose";
import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseObjectSchema, GConstructor } from "./base-object.schema";
import { PersonDto } from "src/common/dto/object/person.dto";

export type PersonDocument = PersonRecordDto & mongoose.Document;

@Schema({collection: 'objects', autoIndex: true})
export class PersonRecordDto extends BaseObjectSchema<GConstructor<PersonDto>>(PersonDto) {
}

export const PersonSchema = SchemaFactory.createForClass(PersonRecordDto);