import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsLink } from '@yuforium/activity-streams';
import { IsNotEmptyArray, IsRequired } from '@yuforium/activity-streams';
import { Transform } from 'class-transformer';
import { Equals, IsOptional, IsString, MaxLength } from 'class-validator';
import { ObjectDto } from '../object.dto';
import sanitizeHtml from 'sanitize-html';

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['strong']);

/**
 * Basic requirements class for all objects submitted for *creation* to the
 * API server by a user through the outbox.  This is a generic class that should be extended
 * by more specific object types.
 */
export class ObjectCreateDto extends PickType(ObjectDto, ['name', 'content', 'type', 'to', 'inReplyTo']) {
  @ApiProperty({ required: false })
  @IsString()
  @MaxLength(255)
  public name!: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsRequired()
  @MaxLength(65536)
  @Transform(({value}) => sanitizeHtml(value, {allowedTags}), {
    toClassOnly: true,
    // note that we _will_ sanitize HTML when a user posts it to their outbox to prevent XSS attacks.
    // different AP software may santize differently, so whatever we store should be the raw content,
    // and we should sanitize on the way out.
    groups: ['outbox']
  })
  public content!: string;

  @ApiProperty({ required: true, enum: ['Object'] })
  @IsString()
  @IsRequired()
  @Equals('Object')
  public type!: string;

  @ApiProperty({required: true})
  @IsNotEmptyArray()
  @IsLink({each: true})
  public to!: string | string[];

  @ApiProperty({
    required: false,
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
  })
  @IsOptional()
  @IsString({ each: true })
  public attributedTo?: string | string[];

  @ApiProperty({
    required: false,
    type: 'string'
  })
  @IsOptional()
  @IsLink()
  public inReplyTo?: string;
}
