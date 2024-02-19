import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ObjectDto } from '../../../common/dto/object';
import { RelationshipDto } from '../../../common/dto/object/relationship.dto';
import { BaseObjectSchema } from './base-object.schema';
import { GConstructor } from '../../../common/schema/base.schema';

export type RelationshipDocument = RelationshipRecord & mongoose.Document;

@Schema({ collection: 'objects', autoIndex: true })
export class RelationshipRecord extends BaseObjectSchema<GConstructor<RelationshipDto>>(RelationshipDto) implements ObjectDto {
  @Prop({ type: String, required: true })
  _relationship!: 'followerOf';
}

export const RelationshipSchema = SchemaFactory.createForClass(RelationshipRecord);
