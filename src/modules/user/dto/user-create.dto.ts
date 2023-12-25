import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
  @MaxLength(256)
  name?: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(256)
  summary?: string;

  @Exclude()
  __v: number | undefined;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  @IsEmail()
  email!: string;
}