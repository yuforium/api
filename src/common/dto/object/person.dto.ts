import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { ASObjectOrLink, Person } from "@yuforium/activity-streams";
import { Exclude, Expose, Transform, Type } from "class-transformer";
import { ObjectRecordDto } from "src/modules/object/schema/object.schema";
import { sslToPlain } from "../util/ssl-to-plain";

export class PublicKey {
  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @Expose()
  id!: string;

  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @Expose()
  owner!: string;

  @Expose()
  publicKeyPem!: string;
}

@Exclude()
export class PersonDto extends ObjectRecordDto {
  static type: 'Person' = 'Person';

  @Expose()
  '@context': string | string[] = 'https://www.w3.org/ns/activitystreams';

  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @ApiProperty({type: 'string', format: 'uri', description: 'The ID of the user'})
  @Expose()
  id!: string;

  @ApiProperty({type: 'string', description: 'The name of the user'})
  name: string | undefined;

  @Transform(sslToPlain, {groups: ['sslToPlain']})
  attributedTo?: string | undefined;

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
  @Type(() => PublicKey)
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  }

  @ApiProperty({type: 'string', format: 'uri'})
  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @Expose()
  get following() {
    return `${this.id}/following`;
  }

  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @Expose()
  get followers() {
    return `${this.id}/followers`;
  }

  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @Expose()
  get inbox() {
    return `${this.id}/inbox`;
  }

  @Transform(sslToPlain, {groups: ['sslToPlain']})
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