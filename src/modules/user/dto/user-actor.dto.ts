import { Expose } from 'class-transformer';
import { ActorDto } from 'src/common/dto/actor/actor.dto';
// import { PersonDto } from 'src/common/dto/object/person.dto';

export class UserActorDto extends ActorDto {
  // @Expose()
  // get inbox(): string {
  //   return this.id + '/inbox';
  // }

  // @Expose()
  // get outbox(): string {
  //   return this.id + '/outbox';
  // }

  @Expose()
  public preferredUsername!: string;
}
