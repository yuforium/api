import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  _id: string;
  
  @Prop()
  username: string;

  @Prop() 
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);