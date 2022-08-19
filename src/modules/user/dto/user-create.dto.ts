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
  username: string | undefined;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  name: string | undefined;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  summary: string | undefined;

  @Exclude()
  __v: number | undefined;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(256)
  password: string | undefined;
}