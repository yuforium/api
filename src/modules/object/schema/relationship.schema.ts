import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { ObjectDto } from "../../../common/dto/object";
import { RelationshipDto } from "../../../common/dto/object/relationship.dto";
import { BaseObjectSchema, GConstructor } from "./base-object.schema";

export type RelationshipDocument = RelationshipRecordDto & mongoose.Document;

@Schema({collection: 'objects', autoIndex: true})
export class RelationshipRecordDto extends BaseObjectSchema<GConstructor<RelationshipDto>>(RelationshipDto) implements ObjectDto {
  @Prop({type: String, required: true})
  _relationship!: 'followerOf'
}

export const RelationshipSchema = SchemaFactory.createForClass(RelationshipRecordDto);