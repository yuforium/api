import { Prop } from '@nestjs/mongoose';
import { Activity, ActivityStreams, ASContext, IsRequired } from '@yuforium/activity-streams';
import { Expose, Transform, Type } from 'class-transformer';
import { Validate, ValidateNested } from 'class-validator';
import * as mongoose from 'mongoose';
import { ArticleDto } from '../../object/dto/object/article.dto';
import { NoteDto } from '../../object/dto/object/note.dto';
import { ContextValidator } from '../validator/context.validator';
import { HttpSignatureDto } from './http-signature.dto';
import { LinkDto } from '../../../modules/object/dto/link.dto';
import { ActorDto } from 'src/modules/object/dto/actor/actor.dto';

const { Mixed } = mongoose.Schema.Types;

export type ActivityDtoObjectTypes = NoteDto | LinkDto;

const transformer = new ActivityStreams.Transformer();
transformer.add(NoteDto, ArticleDto);

export class ActivityDto extends Activity {
  @Prop({type: Mixed, required: true})
  @IsRequired()
  @Validate(ContextValidator, {each: true})
  @Expose()
  public '@context': string | ASContext | (string | ASContext)[] = 'https://www.w3.org/ns/activitystreams';

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public id!: string;

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public type!: string;

  /**
   * @todo this could come in as an object, e.g. {id: 'https://example.com/actor', type: 'Person'}
   */
  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public actor!: string | ActorDto;

  @Prop({type: Mixed, required: true})
  @IsRequired()
  @Expose()
  @ValidateNested({each: true})
  @Transform(params => {
    if (typeof params.value === 'string') {
      return params.value;
    }
    return transformer.transform(params);
  })
  public object!: any;

  @Type(() => HttpSignatureDto)
  @ValidateNested()
  public signature?: HttpSignatureDto;

  // @Prop({type: String, required: true})
  // @IsRequired()
  // @Expose()
  // public published!: string;
}
