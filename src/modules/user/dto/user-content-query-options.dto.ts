import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class UserContentQueryOptionsDto {
  @ApiPropertyOptional({
    name: 'type',
    type: 'string',
    format: 'form',
    default: 'All',
    description: 'Comma separated list of Activity Streams object types to include in the response.',
    example: 'Note,Article'
  })
  @IsOptional()
  public type: string | undefined;

  @ApiPropertyOptional({
    name: 'skip',
    type: 'integer',
    format: 'form',
    default: 0,
    description: 'The number of items to skip before returning the remaining items.',
  })
  @Transform(({value}) => parseInt(value, 10))
  @IsInt()
  public skip: number = 0;

  @ApiPropertyOptional({
    name: 'limit',
    type: 'integer',
    format: 'form',
    default: 20,
    description: 'The maximum number of items to return.',
    example: 1
  })
  @Transform(({value}) => parseInt(value, 10))
  @IsInt()
  public limit: number = 20;

  @ApiPropertyOptional({
    name: 'sort',
    type: 'string',
    default: '-published',
    format: 'form',
    description: 'The sort order of the returned items.',
    example: 'published'
  })
  @IsOptional()
  public sort: string = '-published';
}