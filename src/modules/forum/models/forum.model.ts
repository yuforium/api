import { IsString, Matches } from 'class-validator';

export class Forum {
  @IsString()
  // @prop({required: true, unique: true})
  id: string;

  @IsString()
  // @prop()
  name: string;

  @IsString()
  // @prop()
  summary: string;
}