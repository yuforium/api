import * as mongoose from "mongoose";
import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseObjectSchema, GConstructor } from "../../object/schema/base-object.schema";
import { PersonDto } from "src/common/dto/object/person.dto";
import { Exclude, Expose } from "class-transformer";
import { UserActorDto } from "../dto/user-actor.dto";

export type UserActorDocument = UserActorRecordDto & mongoose.Document;

/**
 * The UserActor will (for now) always be a Person object in Activity Streams.  The record will include some additional methods to get things like the inbox and outbox URLs.
 */
@Schema({collection: 'objects', autoIndex: true})
@Exclude()
export class UserActorRecordDto extends BaseObjectSchema<GConstructor<UserActorDto>>(UserActorDto) {
}

export const UserActorSchema = SchemaFactory.createForClass(UserActorRecordDto);