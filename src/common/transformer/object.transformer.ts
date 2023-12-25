import { ActivityStreams } from '@yuforium/activity-streams';
import { NoteDto } from '../dto/object/note.dto';

const ObjectTransformer = new ActivityStreams.Transformer();

ObjectTransformer.add(NoteDto);

export { ObjectTransformer };