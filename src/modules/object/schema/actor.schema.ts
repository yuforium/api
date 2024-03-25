import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema, GConstructor } from '../../../common/schema/base.schema';
import { ActorDto } from '../../../common/dto/actor/actor.dto';
import mongoose from 'mongoose';
import { ActorType } from '../type/actor.type';

export type ActorDocument = ActorRecord & mongoose.Document;

@Schema({collection: 'objects', autoIndex: true})
export class ActorRecord extends BaseSchema<GConstructor<ActorType>>(ActorDto) { }

export const ActorSchema = SchemaFactory.createForClass(ActorRecord);
