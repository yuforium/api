import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { GConstructor } from '../../../common/schema/base.schema';
import { ActorDto } from '../dto/actor/actor.dto';
import mongoose from 'mongoose';
import { ActorType } from '../type/actor.type';
import { baseObjectRecord } from './base-object.schema';

/**
 * ActorDocument is a type that extends the ActorRecord and adds the mongoose.Document type,
 * representing a document in the database.
 */
export type ActorDocument = ActorRecord & mongoose.Document;

@Schema({collection: 'objects', autoIndex: true})
export class ActorRecord extends baseObjectRecord<GConstructor<ActorType>>(ActorDto) { }
export const ActorSchema = SchemaFactory.createForClass(ActorRecord);
