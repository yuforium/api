import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { Note, IsRequired } from "@yuforium/activity-streams-validator";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

@Expose()
export class NoteDto extends PartialType(
  PickType(Note, ['name', 'content', 'attributedTo', 'to', 'published'])
) {
  @ApiProperty()
  @Expose()
  @MaxLength(255)
  public name: string | undefined;

  @ApiProperty()
  @Expose()
  @IsRequired()
  @IsUrl({each: true})
  public attributedTo: string | string[] | undefined;

  @MaxLength(500) // make it compatible with Mastodon for now
  @ApiProperty()
  @IsRequired()
  public content: string | undefined;

  @ApiProperty()
  @IsRequired()
  @IsUrl({each: true})
  public to: string | string[] | undefined;

  @ApiProperty()
  public published: string | undefined;
}