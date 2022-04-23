import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsRequired, Service } from '@yuforium/activity-streams-validator';

export class ForumCreateDtoOld {
  @ApiProperty()
  @IsString()
  forumId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  summary: string;
}

export class ForumCreateDto extends PartialType(
  PickType(Service, ['name', 'summary'])
) {
  @ApiProperty()
  @IsString()
  @IsRequired()
  public id: string;

  @MaxLength(256)
  @ApiProperty()
  @IsRequired()
  public name: string;

  @MaxLength(4096)
  @ApiProperty()
  public summary: string;
}