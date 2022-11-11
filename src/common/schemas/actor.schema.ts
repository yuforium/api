import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Actor as BaseActor } from '@yuforium/activity-streams';
import { Document } from 'mongoose';

export type ActorDocument = Actor & Document;

@Schema({collection: 'objects'})
export class Actor extends BaseActor {
  @Prop()
  id?: string
}

export const ActorSchema = SchemaFactory.createForClass(Actor);