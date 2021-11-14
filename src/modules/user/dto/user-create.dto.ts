import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UserCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(64)
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
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(256)
  password: string;
}