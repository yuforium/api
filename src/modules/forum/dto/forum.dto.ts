import { Expose } from "class-transformer";
import { ObjectDto } from "../../../common/dto/object";

export class ForumDto extends ObjectDto {
  @Expose()
  name: string | undefined;

  @Expose()
  summary: string | undefined;

  @Expose({name: 'inbox'})
  getInbox(): string {
    return `${this.id}/inbox`;
  }

  @Expose()
  get outbox(): string {
    return `${this.id}/outbox`;
  }

  @Expose()
  get followers(): string {
    return `${this.id}/followers`;
  }

  @Expose()
  get following(): string {
    return `${this.id}/following`;
  }

  liked: string | undefined;
}