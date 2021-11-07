import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsString } from "class-validator";

export class UserCreateDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  summary: string;

  @Exclude()
  __v: number;

  @ApiProperty()
  @Exclude()
  password: string;
}