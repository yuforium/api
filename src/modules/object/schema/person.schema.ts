import * as mongoose from "mongoose";
import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseObjectSchema, GConstructor } from "./base-object.schema";
import { PersonDto } from "src/common/dto/object/person.dto";
import { Exclude } from "class-transformer";

export type PersonDocument = PersonRecordDto & mongoose.Document;

/**
 * @deprecated for use with the user module, which should use the UserActorRecordDto instead
 */
@Schema({collection: 'objects', autoIndex: true})
export class PersonRecordDto extends BaseObjectSchema<GConstructor<PersonDto>>(PersonDto) {
  @Exclude()
  to!: string | string[];
}

export const PersonSchema = SchemaFactory.createForClass(PersonRecordDto);