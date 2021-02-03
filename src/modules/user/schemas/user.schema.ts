import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({collection: 'objects'})
export class User {
  @Prop()
  id: string;

  @Prop()
  username: string;

  @Prop()
  name: string;

  @Prop()
  summary: string;

  @Prop() 
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);