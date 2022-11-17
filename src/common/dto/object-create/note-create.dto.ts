import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsRequired } from "@yuforium/activity-streams";
import { Equals, IsOptional, MaxLength } from "class-validator";
import { ObjectCreateDto } from "src/common/dto/object-create/object-create.dto";

export class NoteCreateDto extends OmitType(ObjectCreateDto, ['name'] as const) {
  static type = 'Note';

  @MaxLength(500) // make it compatible with Mastodon for now
  @ApiProperty()
  @IsRequired()
  public content!: string;

  @ApiProperty({required: true, oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}], format: 'uri'})
  // @IsUrl({each: true}) @todo this is not working properly
  @IsRequired()
  public to!: string | string[];

  @Equals('Note')
  @ApiProperty({type: 'string', enum: ['Note']})
  public type: string = 'Note';
}