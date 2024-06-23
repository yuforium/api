import { ApiProperty } from '@nestjs/swagger';
import { Equals, MaxLength } from 'class-validator';
import { ObjectCreateDto } from './object-create.dto';

export class StringArray extends Array<string> {}

export class NoteCreateDto extends ObjectCreateDto {
  static type = 'Note';

  @MaxLength(500) // make it compatible with Mastodon for now
  public content!: string;

  @Equals('Note')
  @ApiProperty({enum: ['Note']})
  public type: string = 'Note';
}