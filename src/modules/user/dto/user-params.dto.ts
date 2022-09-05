import { IsString, Matches } from "class-validator";

export class UserParamsDto {
  @Matches(/^[a-z](?:-?[a-z0-9]+)*$/i)
  @IsString()
  username: string | undefined;
}