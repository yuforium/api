import { IsString, Matches } from "class-validator";
import { ServiceId } from "src/common/decorators/service-id.decorator";

export class UserParamsDto {
  @Matches(/^[a-z](?:-?[a-z0-9]+)*$/i)
  @IsString()
  username: string;
}