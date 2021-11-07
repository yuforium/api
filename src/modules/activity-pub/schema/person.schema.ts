import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Person as BasePerson, ActivityStreams } from '@yuforium/activity-streams-validator';
import { Exclude, Transform } from 'class-transformer';
import { Document, Mongoose, Schema as MongooseSchema } from 'mongoose';

export type PersonDocument = Person & Document;

@Schema({collection: 'objects'})
export class Person extends BasePerson {
  @Transform((_id: any) => _id.toHexString(), {toPlainOnly: true})
  _id?: MongooseSchema.Types.ObjectId;

  @Prop()
  type: string;

  @Prop()
  preferredUsername?: string;

  @Prop()
  id?: string;

  @Prop()
  name?: string;

  @Prop()
  nameMap?: ActivityStreams.ContentMap;

  @Prop()
  summary?: string;

  @Prop()
  summaryMap?: ActivityStreams.ContentMap;

  @Exclude()
  __v: number;
}

export const PersonSchema = SchemaFactory.createForClass(Person);