import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmptyArray, IsRequired } from '@yuforium/activity-streams';
import { Equals, IsString, MaxLength } from 'class-validator';
import { ObjectDto } from '../object/object.dto';

/**
 * Basic requirements class for all objects submitted for *creation* to the
 * API server by the user.  This is a generic class that should be extended
 * by more specific object types.
 */
export class ObjectCreateDto extends PickType(ObjectDto, ['name', 'content', 'type', 'to', 'attributedTo']) {
  @ApiProperty({required: false})
  @IsString()
  @MaxLength(255)
  public name!: string;

  @ApiProperty({required: true})
  @IsString()
  @IsRequired()
  @MaxLength(65536)
  public content!: string;

  @ApiProperty({required: true, enum: ['Object']})
  @IsString()
  @IsRequired()
  @Equals('Object')
  public type!: string;

  @ApiProperty({required: true})
  @IsNotEmptyArray()
  @IsString({each: true})
  public to!: string | string[];

  @ApiProperty({required: false})
  @IsString({each: true})
  public attributedTo!: string | string[];
}
