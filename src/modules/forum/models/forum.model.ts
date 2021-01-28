import { Typegoose, prop } from '@typegoose/typegoose';
import { IsString, Matches } from 'class-validator';

export class Forum extends Typegoose {
  @IsString()
  @prop({required: true, unique: true})
  id: string;

  @IsString()
  @prop()
  name: string;

  @IsString()
  @prop()
  summary: string;
}