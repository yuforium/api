import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import * as mongoose from 'mongoose';
import { ObjectDto } from "../../../common/dto/object/object.dto";

export type ObjectDocument = ObjectRecordDto & mongoose.Document;

const {Mixed} = mongoose.Schema.Types;

/**
 * DTO for an Object record, which extends the Object DTO and adds any additional fields that are specific to the database record.
 */
@Schema({collection: 'objects', autoIndex: true})
export class ObjectRecordDto extends ObjectDto {
  @Exclude()
  public _id?: string;

  @Prop({type: String})
  @Exclude()
  public _serviceId?: string;

  @Prop({type: Boolean, default: false})
  @Exclude()
  public _public?: boolean;
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectRecordDto);

/**
 * Called "StreamObject" in the spec although in ActivityPub it is called "Object".  Try to use Object where possible.
 * @todo revisit this as it contains more fields than the above mentioned ObjectRecordDto
 */
// @Schema({collection: 'objects', autoIndex: true})
// export class StreamObject {
//   @Prop({})
//   '@context'?: string

//   @Prop({type: String, required: true, unique: true})
//   id: string | undefined;

//   @Prop({type: String, required: true})
//   _serviceId: string | undefined;

//   @Prop({type: String, required: true})
//   type: string = 'Object';

//   @Prop({type: Mixed})
//   attachment?: any;

//   @Prop({type: Mixed})
//   attributedTo?: any;

//   @Prop({type: Mixed})
//   audience?: any;

//   @Prop({type: Mixed})
//   content?: any;

//   @Prop({type: Mixed})
//   context?: any;

//   @Prop({type: Mixed})
//   contentMap?: any;

//   @Prop({type: Mixed})
//   name?: string;

//   @Prop({type: Mixed})
//   nameMap?: any;

//   @Prop({type: Mixed})
//   endTime?: any;

//   @Prop({type: Mixed})
//   generator?: any;

//   @Prop({type: Mixed})
//   icon?: any;

//   @Prop({type: Mixed})
//   image?: any;

//   @Prop({type: Mixed})
//   inReplyTo?: any;

//   @Prop({type: Array})
//   _ancestor?: any[];

//   @Prop({type: Mixed})
//   location?: any;

//   @Prop({type: String})
//   preferredUsername?: string;

//   @Prop({type: Mixed})
//   preview?: any;

//   @Prop({type: Mixed})
//   published?: string;

//   @Prop({type: Mixed})
//   replies?: any;

//   @Prop({type: Mixed})
//   startTime?: string;

//   @Prop({type: Mixed})
//   summary?: any;

//   @Prop({type: Mixed})
//   summaryMap?: any;

//   @Prop({type: Mixed})
//   tag?: any;

//   @Prop({type: Mixed})
//   updated?: string;

//   @Prop({type: Mixed})
//   url?: any;

//   @Prop({type: Mixed})
//   to?: any;

//   @Prop({type: Mixed})
//   bto?: any;

//   @Prop({type: Mixed})
//   cc?: any;

//   @Prop({type: Mixed})
//   bcc?: any;

//   @Prop({type: Mixed})
//   mediaType?: any;

//   @Prop({type: Mixed})
//   duration?: any;
// }

// export const ObjectSchema = SchemaFactory.createForClass(StreamObject);