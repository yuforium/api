import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNotEmptyArray, IsRequired } from "@yuforium/activity-streams";
import { Equals, IsOptional, MaxLength } from "class-validator";
import { ObjectCreateDto } from "../../../common/dto/object-create/object-create.dto";

export class StringArray extends Array<string> {}

export class NoteCreateDto extends ObjectCreateDto {
  static type = 'Note';

  @MaxLength(500) // make it compatible with Mastodon for now
  public content!: string;

  @Equals('Note')
  @ApiProperty({enum: ['Note']})
  public type: string = 'Note';
}