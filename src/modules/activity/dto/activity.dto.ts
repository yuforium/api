import { Prop } from "@nestjs/mongoose";
import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, IsRequired } from "@yuforium/activity-streams";
import { Expose, Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import * as mongoose from "mongoose";
import { NoteDto } from "../../object/dto/object.dto";
import { ObjectDto } from "../../../modules/object/dto/object.dto";
import { LinkDto } from "src/modules/link/dto/link.dto";

const { Mixed } = mongoose.Schema.Types;

export type ActivityDtoObjectTypes = NoteDto | LinkDto;

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
  @Type(() => ObjectDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        {name: 'Link', value: LinkDto},
        {name: 'Note', value: NoteDto}
      ]
    },
    keepDiscriminatorProperty: true
  })
  public object!: NoteDto | LinkDto;

  @Prop({type: String})
  @IsOptional()
  @Expose()
  public target!: string;

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public published!: string;
}