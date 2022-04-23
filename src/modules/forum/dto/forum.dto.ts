import { Expose } from "class-transformer";

export class ForumDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  summary: string;

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

  liked: string;
}