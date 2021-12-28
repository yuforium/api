import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import * as mongoose from 'mongoose';

export type ObjectDocument = StreamObject & mongoose.Document;

const {Mixed} = mongoose.Schema.Types;

/**
 * Called "StreamObject" in the spec although in ActivityPub it is called "Object".  Try to use Object where possible.
 */
@Schema({collection: 'objects'})
export class StreamObject {
  @Prop({})
  '@context'?: string

  @Prop({required: true})
  id: string;

  @Prop({required: true})
  type: string = 'Object';

  @Prop({type: Mixed})
  attachment?: any;

  @Prop({type: Mixed})
  attributedTo?: any;

  @Prop({type: Mixed})
  audience?: any;

  @Prop({type: Mixed})
  content?: any;

  @Prop({type: Mixed})
  context?: any;

  @Prop({type: Mixed})
  contentMap?: any;

  @Prop({type: Mixed})
  name?: string;

  @Prop({type: Mixed})
  nameMap?: any;

  @Prop({type: Mixed})
  endTime?: any;

  @Prop({type: Mixed})
  generator?: any;

  @Prop({type: Mixed})
  icon?: any;

  @Prop({type: Mixed})
  image?: any;

  @Prop({type: Mixed})
  inReplyTo?: any;

  @Prop({type: Array})
  _ancestor?: any[];

  @Prop({type: Mixed})
  location?: any;

  @Prop({type: Mixed})
  preview?: any;

  @Prop({type: Mixed})
  published?: string;

  @Prop({type: Mixed})
  replies?: any;

  @Prop({type: Mixed})
  startTime?: string;

  @Prop({type: Mixed})
  summary?: any;

  @Prop({type: Mixed})
  summaryMap?: any;

  @Prop({type: Mixed})
  tag?: any;

  @Prop({type: Mixed})
  updated?: string;

  @Prop({type: Mixed})
  url?: any;

  @Prop({type: Mixed})
  to?: any;

  @Prop({type: Mixed})
  bto?: any;

  @Prop({type: Mixed})
  cc?: any;

  @Prop({type: Mixed})
  bcc?: any;

  @Prop({type: Mixed})
  mediaType?: any;

  @Prop({type: Mixed})
  duration?: any;
}

export const ObjectSchema = SchemaFactory.createForClass(StreamObject);