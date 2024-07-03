import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';
import { ObjectCreateDto } from './object-create.dto';

export class ArticleCreateDto extends ObjectCreateDto {
  static readonly type = 'Article';

  @Equals('Article')
  @ApiProperty({type: 'string', enum: ['Article']})
  public type: string = 'Article';
}
