import { Expose } from 'class-transformer';
import { ActorDto } from '../../object/dto/actor/actor.dto';

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
