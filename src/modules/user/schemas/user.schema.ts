import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema({collection: 'user', autoIndex: true})
export class User {
  @Prop({required: true})
  serviceId: string;

  @Prop({required: true, lowercase: true})
  username: string;

  @Prop({required: true})
  password: string;

  @Prop()
  type: string;

  @Prop({type: Array})
  identities: any[] = [];

  @Prop()
  defaultIdentity: mongoose.Schema.Types.ObjectId
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({serviceId: 1, username: 1}, {unique: true});