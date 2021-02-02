import { UserCreateDto } from "./user-create.dto";

export class UserDto extends UserCreateDto {
  public _id: string;
}