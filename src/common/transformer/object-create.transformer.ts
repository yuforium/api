import { ActivityStreams } from '@yuforium/activity-streams';
import { ArticleCreateDto } from '../dto/object-create/article-create.dto';
import { NoteCreateDto } from '../dto/object-create/note-create.dto';

export const ObjectCreateTransformer = new ActivityStreams.Transformer(undefined, {convertTextToLinks: false});

ObjectCreateTransformer.add(ArticleCreateDto, NoteCreateDto);
