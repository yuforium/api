import { ActivityStreams } from '@yuforium/activity-streams';
import { ArticleCreateDto } from '../../modules/object/dto/object-create/article-create.dto';
import { NoteCreateDto } from '../../modules/object/dto/object-create/note-create.dto';

export const ObjectCreateTransformer = new ActivityStreams.Transformer(undefined, {convertTextToLinks: false});

ObjectCreateTransformer.add(ArticleCreateDto, NoteCreateDto);
