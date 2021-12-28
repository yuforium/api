import { Person } from "@yuforium/activity-streams-validator";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PersonDto extends Person {
  @Expose()
  id;

  @Expose()
  summary?;

  @Expose()
  type;

  @Expose()
  preferredUsername;

  @Expose()
  get following() {
    return `${this.id}/following`;
  }

  @Expose()
  get followers() {
    return `${this.id}/followers`;
  }

  @Expose()
  get inbox() {
    return `${this.id}/inbox`;
  }

  @Expose()
  get outbox() {
    return `${this.id}/outbox`;
  }

  @Expose()
  get streams() {
    return [
      {
        type: 'Link',
        href: `${this.id}/content`,
        name: `Content posted by this user`
      }
    ];
  }
}