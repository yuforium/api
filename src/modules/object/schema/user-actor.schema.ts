import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema, GConstructor } from '../../../common/schema/base.schema';
import { ActorDto } from '../dto/actor/actor.dto';
import mongoose from 'mongoose';
import { ActorType } from '../type/actor.type';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export type UserActorDocument = UserActorRecord & mongoose.Document;

@Schema({collection: 'objects', autoIndex: true})
export class UserActorRecord extends BaseSchema<GConstructor<ActorType>>(ActorDto) {
  @Expose()
  @Prop({type: String, required: true})
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  public inbox!: string;

  @Expose()
  @Prop({type: String, required: true})
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  public outbox!: string;

  @Expose()
  @Prop({type: String, required: true})
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  public followers!: string;

  @Expose()
  @Prop({type: String, required: true})
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  public following!: string;
}
export const UserActorSchema = SchemaFactory.createForClass(UserActorRecord);
