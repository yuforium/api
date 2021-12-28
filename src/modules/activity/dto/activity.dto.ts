import { ActivityStreams } from "@yuforium/activity-streams-validator";
import { Expose, Type } from "class-transformer";

export class ActivityDto extends ActivityStreams.Activity {
}
