import { ActivityStreams } from '@yuforium/activity-streams';
import { NoteDto } from 'src/common/dto/object/note.dto';
import { ObjectDto } from '../../../common/dto/object/object.dto';

const transformer = new ActivityStreams.Transformer();

transformer.add(ObjectDto, NoteDto);

export { transformer };