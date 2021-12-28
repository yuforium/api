import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, Note } from "@yuforium/activity-streams-validator";
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class NoteCreateDto extends PartialType(
  PickType(Note, ['name', 'content', 'attributedTo', 'published'])
) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500) // make it compatible with Mastodon for now
  @ApiProperty()
  public content: string;

  @IsString()
  @IsOptional()
  public attributedTo: string;

  @IsOptional()
  public published: string;

  @IsString({each: true})
  // @IsUrl({each: true})
  public to: string|string[];
}