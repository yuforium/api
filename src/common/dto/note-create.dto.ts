import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { Note, IsRequired } from "@yuforium/activity-streams-validator";
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class NoteCreateDto extends PartialType(
  PickType(Note, ['name', 'content', 'attributedTo', 'to', 'published'])
) {
  @MaxLength(500) // make it compatible with Mastodon for now
  @ApiProperty()
  @IsRequired()
  public content: string;

  @IsRequired()
  // @IsUrl({each: true})
  public to: string|string[];
}