import { ActivityStreams } from '@yuforium/activity-streams';
import { NoteDto } from '../../modules/object/dto/object/note.dto';

const ObjectTransformer = new ActivityStreams.Transformer(undefined, {convertTextToLinks: false});

ObjectTransformer.add(NoteDto);

export {ObjectTransformer};
