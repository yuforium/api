import { ActivityStreams } from "@yuforium/activity-streams";
import { NoteCreateDto } from "../dto/create/note-create.dto";

export const CreateTransformer = new ActivityStreams.Transformer();

CreateTransformer.add(NoteCreateDto);