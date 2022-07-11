import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { Person } from "@yuforium/activity-streams-validator";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PersonDto extends Person {
  @ApiProperty({type: 'string', format: 'uri', description: 'The ID of the user'})
  @Expose()
  id;

  @ApiProperty({type: 'string', description: 'The name of the user'})
  name;

  @ApiProperty({type: 'string'})
  @Expose()
  summary?;

  @ApiProperty({type: 'string'})
  @Expose()
  type;

  @ApiProperty({type: 'string'})
  @Expose()
  preferredUsername;

  @ApiProperty({type: 'string', format: 'uri'})
  @Expose()
  get following() {
    return `${this.id}/following`;
  }

  @Expose()
  get followers() {
    return `${this.id}/followers`;
  }

  @Expose()
  get inbox() {
    return `${this.id}/inbox`;
  }

  @Expose()
  get outbox() {
    return `${this.id}/outbox`;
  }

  @Expose()
  get streams() {
    return [
      {
        type: 'Link',
        href: `${this.id}/content`,
        name: `Content posted by this user`
      }
    ];
  }
}