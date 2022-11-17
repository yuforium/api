import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNotEmptyArray, IsRequired } from "@yuforium/activity-streams";
import { IsEnum, IsIn, MaxLength } from "class-validator";
import { ObjectDto } from "../object/object.dto";

/**
 * Basic requirements class for all objects submitted for *creation* to the API server by the user
 */
export class ObjectCreateDto extends PickType(ObjectDto, ['name', 'content', 'type', 'attributedTo', 'to', 'published']) {
  @ApiProperty()
  @IsRequired()
  public name!: string;

  @ApiProperty({required: true, oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}], format: 'uri'})
  @IsRequired()
  @MaxLength(65536) // 64KB
  public content!: string;

  @ApiProperty({required: true, type: 'string', enum: ['Object']})
  @IsRequired()
  public type!: string;

  @ApiProperty({required: true, oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}], format: 'uri'})
  // @IsUrl({each: true}) @todo this is not working properly
  @IsNotEmptyArray()
  @IsRequired()
  public to!: string | string[];
}