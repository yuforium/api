import { BaseObject } from "./base-object.schema";
import * as mongoose from 'mongoose';
import { Prop, SchemaFactory } from "@nestjs/mongoose";

export type PersonDocument = Person & mongoose.Document;

export class Person extends BaseObject {
  @Prop({type: String})
  public readonly type: string = 'Person';

  @Prop({required: true, type: String, lowercase: true})
  public preferredUsername: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);