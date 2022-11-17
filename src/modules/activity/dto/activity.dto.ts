import { Prop } from "@nestjs/mongoose";
import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, IsRequired } from "@yuforium/activity-streams";
import { Expose, Transform, Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import * as mongoose from "mongoose";
import { NoteDto, ArticleDto } from "../../../common/dto/object";
import { LinkDto } from "src/modules/link/dto/link.dto";

const { Mixed } = mongoose.Schema.Types;

export type ActivityDtoObjectTypes = NoteDto | LinkDto;

const transformer = new ActivityStreams.Transformer();
transformer.add(NoteDto, ArticleDto);

export class ActivityDto extends ActivityStreams.activity('Activity') {
  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public id!: string;

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public type!: string;

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public actor!: string;

  @Prop({type: Mixed, required: true})
  @IsRequired()
  @Expose()
  @ValidateNested({each: true})
  @Transform(params => transformer.transform(params))
  public object!: any;

  @Prop({type: String})
  @IsOptional()
  @Expose()
  public target!: string;

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public published!: string;
}