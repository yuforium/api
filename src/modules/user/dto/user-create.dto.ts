import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class UserCreateDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  @ApiPropertyOptional()
  name: string;

  @ApiProperty()
  summary: string;

  @Exclude()
  __v: number;

  @ApiProperty()
  @Exclude()
  password: string;
}