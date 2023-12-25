import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema, GConstructor } from './base.schema';
import { ActorDto } from '../../../common/dto/actor/actor.dto';
import mongoose from 'mongoose';

export type ActorDocument = ActorRecord & mongoose.Document;

@Schema({collection: 'objects', autoIndex: true})
export class ActorRecord extends BaseSchema<GConstructor<ActorDto>>(ActorDto) {
  // @Expose()
  // public get inbox(): string | undefined {
  //   if (this._local) {
  //     return `https://${this._domain}/inbox`;
  //   }

  //   return undefined;
  // }

  // @Expose()
  // public get outbox(): string | undefined {
  //   if (this._local) {
  //     return `https://${this._domain}/outbox`;
  //   }

  //   return undefined;
  // }
}

export const ActorSchema = SchemaFactory.createForClass(ActorRecord);