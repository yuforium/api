import { Exclude } from 'class-transformer';
import { ActorDto } from '../../object/dto/actor/actor.dto';

export class JwtUserActorDto extends ActorDto {
  @Exclude()
  public get inbox(): string {
    return `${this.id}/inbox`;
  }

  @Exclude()
  public get outbox(): string {
    return `${this.id}/outbox`;
  }

  @Exclude()
  public get followers(): string {
    return `${this.id}/followers`;
  }

  @Exclude()
  public get following(): string {
    return `${this.id}/following`;
  }
}
