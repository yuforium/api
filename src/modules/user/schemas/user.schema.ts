import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema({collection: 'user'})
export class User {
  @Prop({unique: true, lowercase: true})
  username: string;

  @Prop()
  password: string;

  @Prop()
  type: string;

  @Prop({type: Array})
  identities: any[] = [];

  @Prop()
  defaultIdentity: mongoose.Schema.Types.ObjectId
}

export const UserSchema = SchemaFactory.createForClass(User);