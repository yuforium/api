import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsRequired, Service } from '@yuforium/activity-streams-validator';

export class ForumCreateDto extends PartialType(
  PickType(Service, ['name', 'summary', 'type'])
) {
  @ApiProperty()
  @IsString()
  @IsRequired()
  public pathId: string;

  @MaxLength(256)
  @ApiProperty()
  @IsRequired()
  public name: string;

  @MaxLength(4096)
  @ApiProperty()
  public summary: string;


}