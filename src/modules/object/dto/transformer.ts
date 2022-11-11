import { ActivityStreams } from "@yuforium/activity-streams";
import { NoteDto, ObjectDto } from "./object.dto";

const transformer = new ActivityStreams.Transformer();

transformer.add(ObjectDto, NoteDto);

export { transformer };