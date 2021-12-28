import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ActivityStreams } from "@yuforium/activity-streams-validator";
import { NoteCreateDto } from "src/modules/activity-pub/dto/note-create.dto";

export const StreamObject = createParamDecorator(
  (data: ActivityStreams.StreamObject[], ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return new NoteCreateDto();
  }
)