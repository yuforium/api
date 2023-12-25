import * as mongoose from 'mongoose';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseObjectSchema } from './base-object.schema';
import { PersonDto } from '../../../common/dto/object/person.dto';
import { Exclude } from 'class-transformer';
import { GConstructor } from './base.schema';

export type PersonDocument = PersonRecordDto & mongoose.Document;

/**
 * @deprecated for use with the user module, which should use the UserActorRecordDto instead
 */
@Schema({collection: 'objects', autoIndex: true})
export class PersonRecordDto extends BaseObjectSchema<GConstructor<PersonDto>>(PersonDto) {
  @Exclude()
    to!: string | string[];
}

export const PersonSchema = SchemaFactory.createForClass(PersonRecordDto);