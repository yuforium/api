import { IsNumber, IsOptional } from "class-validator";
import { ServiceId } from "src/common/decorators/service-id.decorator";

export class UserContentQueryDto {
  @IsOptional()
  public type: string;

  @IsNumber()
  public skip: number = 0;

  @IsNumber()
  public limit: number = 10;
}