import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsRequired } from "@yuforium/activity-streams";
import { IsEnum, IsIn } from "class-validator";
import { ObjectDto } from "../../../modules/object/dto/object.dto";

/**
 * Basic requirements class for all objects submitted for *creation* to the API server by the user
 */
export abstract class ObjectCreateDto extends PickType(ObjectDto, ['name', 'content', 'type', 'attributedTo', 'to', 'published']) {
  @ApiProperty()
  @IsRequired()
  public name!: string;

  @ApiProperty({required: true, oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}], format: 'uri'})
  @IsRequired()
  public content!: string;

  @ApiProperty({required: true, type: 'string', enum: ['Object']})
  @IsRequired()
  public type!: string;
}