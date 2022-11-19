import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UserCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(64)
  username!: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  summary?: string;

  @Exclude()
  __v: number | undefined;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(256)
  password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  @IsEmail()
  email!: string;
}