import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ObjectRecord } from '../../../modules/object/schema/object.schema';

export class PublicKey {
  @Expose()
    id!: string;

  @Expose()
    owner!: string;

  @Expose()
    publicKeyPem!: string;
}

@Exclude()
export class PersonDto extends ObjectRecord {
  static type = 'Person' as const;

  @Expose()
  public '@context': string | string[] = 'https://www.w3.org/ns/activitystreams';

  @ApiProperty({type: 'string', format: 'uri', description: 'The ID of the user'})
  @Expose()
  public id!: string;

  @ApiProperty({type: 'string', description: 'The name of the user'})
  public name: string | undefined;

  @ApiProperty({type: 'string'})
  @Expose()
  public summary?: string;

  @ApiProperty({type: 'string'})
  @Expose()
  public type: string = 'Person';

  @ApiProperty({type: 'string'})
  @Expose()
  public preferredUsername: string | undefined;

  @Expose()
  @Type(() => PublicKey)
  public publicKey?: {
      id: string;
      owner: string;
      publicKeyPem: string;
    };
}