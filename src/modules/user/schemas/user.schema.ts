import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema({collection: 'user', autoIndex: true})
export class User {
  @Prop({type: String, required: true})
  serviceId: string | undefined;

  @Prop({type: String, required: true, lowercase: true})
  username: string | undefined;

  @Prop({type: String, required: true})
  password: string | undefined;

  @Prop({type: String})
  type: string | undefined;

  @Prop({type: Array})
  identities: any[] = [];

  @Prop({type: mongoose.Schema.Types.ObjectId})
  defaultIdentity: mongoose.Schema.Types.ObjectId | undefined;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({serviceId: 1, username: 1}, {unique: true});