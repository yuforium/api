import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { RelationshipDto } from '../../../common/dto/object/relationship.dto';
import { BaseObjectSchema } from './base-object.schema';
import { GConstructor } from '../../../common/schema/base.schema';
import { RelationshipType } from '../type/relationship.type';

export type RelationshipDocument = RelationshipRecord & mongoose.Document;

@Schema({ collection: 'objects', autoIndex: true })
export class RelationshipRecord extends BaseObjectSchema<GConstructor<RelationshipType>>(RelationshipDto) {
  @Prop({ type: String, required: true })
  public _relationship!: string;
}

export const RelationshipSchema = SchemaFactory.createForClass(RelationshipRecord);
