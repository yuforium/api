import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class UserCreateDto {
  id: string;

  public readonly '@context' = 'https://www.w3.org/ns/activitystreams';

  public readonly 'type' = 'Person';

  @ApiProperty()
  username: string;

  @ApiProperty()
  @ApiPropertyOptional()
  name: string;

  @ApiProperty()
  summary: string;

  @Exclude()
  _id: any;

  @Exclude()
  __v: number;

  @ApiProperty()
  @Exclude()
  password: string;
}