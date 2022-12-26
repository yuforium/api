import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { Person } from "@yuforium/activity-streams";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PersonDto extends Person {
  static type: 'Person' = 'Person';

  @Expose()
  '@context': string | string[] = 'https://www.w3.org/ns/activitystreams';

  @ApiProperty({type: 'string', format: 'uri', description: 'The ID of the user'})
  @Expose()
  id!: string;

  @ApiProperty({type: 'string', description: 'The name of the user'})
  name: string | undefined;

  @ApiProperty({type: 'string'})
  @Expose()
  summary?: string;

  @ApiProperty({type: 'string'})
  @Expose()
  type: string = 'Person';

  @ApiProperty({type: 'string'})
  @Expose()
  preferredUsername: string | undefined;

  @Expose()
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  }

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