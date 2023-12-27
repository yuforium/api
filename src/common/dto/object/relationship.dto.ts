import { Prop } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { ObjectDto } from './object.dto';

@Exclude()
export class RelationshipDto extends ObjectDto {
  static type = 'Relationship';

  @Prop({type: String, required: true})
  @IsString()
  public subject!: string;

  @Prop({type: String, required: true})
  @IsString()
  public object!: string;

  @Prop({type: String, required: true})
  @IsString()
  public relationship!: string;
}