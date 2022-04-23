import { Expose } from "class-transformer";

export class ForumResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  summary: string;

  @Expose()
  get inbox(): string {
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