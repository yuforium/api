import { ApiProperty } from '@nestjs/swagger';
import { Equals, MaxLength } from 'class-validator';
import { ObjectCreateDto } from './object-create.dto';

export class NoteCreateDto extends ObjectCreateDto {
  static type = 'Note';

  @MaxLength(65536) // we could make this 500 to make it compatible with Mastodon, but also create a separate `TootDto` for Mastodon compatibility
  public content!: string;

  @Equals('Note')
  @ApiProperty({enum: ['Note']})
  public type: string = 'Note';
}
