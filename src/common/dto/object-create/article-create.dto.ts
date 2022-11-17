import { ApiProperty } from "@nestjs/swagger";
import { Equals, MaxLength } from "class-validator";
import { ObjectCreateDto } from "./object-create.dto";

export class ArticleCreateDto extends ObjectCreateDto {
  static type = 'Article';

  @Equals('Article')
  @ApiProperty({type: 'string', enum: ['Article']})
  public type: string = 'Article';
}