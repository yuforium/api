import { Prop } from '@nestjs/mongoose';
import { Activity, ActivityStreams, IsRequired } from '@yuforium/activity-streams';
import { Expose, Transform } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import * as mongoose from 'mongoose';
import { NoteDto, ArticleDto } from '../../../common/dto/object';
import { LinkDto } from 'src/modules/link/dto/link.dto';

const { Mixed } = mongoose.Schema.Types;

export type ActivityDtoObjectTypes = NoteDto | LinkDto;

const transformer = new ActivityStreams.Transformer();
transformer.add(NoteDto, ArticleDto);

export class ActivityDto extends Activity {
  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public id!: string;

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public type!: string;

  @Prop({type: String, required: true})
  @IsRequired()
  @Expose()
  public actor!: string;

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

  // @Prop({type: String, required: true})
  // @IsRequired()
  // @Expose()
  // public published!: string;
}