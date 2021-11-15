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
}