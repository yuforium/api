import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ObjectRecordDto } from '../../../modules/object/schema/object.schema';

export class PublicKey {
  @Expose()
    id!: string;

  @Expose()
    owner!: string;

  @Expose()
    publicKeyPem!: string;
}

@Exclude()
export class PersonDto extends ObjectRecordDto {
  static type = 'Person' as const;

  @Expose()
    '@context': string | string[] = 'https://www.w3.org/ns/activitystreams';

  @ApiProperty({type: 'string', format: 'uri', description: 'The ID of the user'})
  @Expose()
    id!: string;

  @ApiProperty({type: 'string', description: 'The name of the user'})
    name: string | undefined;

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
    };
}