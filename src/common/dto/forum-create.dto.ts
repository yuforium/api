import { IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsRequired, Service } from '@yuforium/activity-streams';

export class ForumCreateDto extends PartialType(PickType(Service, ['name', 'summary', 'type'])
) {
  @ApiProperty()
  @IsString()
  @IsRequired()
  public pathId: string | undefined;

  @MaxLength(256)
  @ApiProperty()
  @IsRequired()
  public name: string | undefined;

  @MaxLength(4096)
  @ApiProperty()
  public summary: string | undefined;
}