import { Exclude, Expose } from "class-transformer";
import { PersonDto } from "src/common/dto/object/person.dto";

export class UserActorDto extends PersonDto {
  @Exclude()
  to!: string | string[];
  
  @Expose()
  get inbox(): string {
    return this.id + '/inbox';
  }

  @Expose()
  get outbox(): string {
    return this.id + '/outbox';
  }

  @Expose()
  preferredUsername!: string;
}