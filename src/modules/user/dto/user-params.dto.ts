import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UserParamsDto {
  @MinLength(5)
  @MaxLength(64)
  @Matches(/^[a-z](?:-?[a-z0-9]+){3,255}$/i)
  @IsString()
  @IsNotEmpty()
  username!: string;
}