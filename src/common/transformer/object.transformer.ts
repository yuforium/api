import { ActivityStreams } from '@yuforium/activity-streams';
import { NoteDto } from '../dto/object/note.dto';

const ObjectTransformer = new ActivityStreams.Transformer(undefined, {convertTextToLinks: false});

ObjectTransformer.add(NoteDto);

export { ObjectTransformer };
