import { ArgumentMetadata, BadRequestException, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { ActivityStreams } from '@yuforium/activity-streams';
import { Constructor } from '@yuforium/activity-streams/dist/util/constructor';
import { validate, ValidationError } from 'class-validator';
import { ObjectCreateDto } from 'src/common/dto/create/object-create.dto';

@Injectable()
export class ActivityStreamsPipe implements PipeTransform {
  protected allowedTypes: string[] = [];
  // protected transformer: Function;

  constructor(@Optional() protected transformer: ActivityStreams.Transformer) {
    if (this.transformer === undefined) {
      this.transformer = ActivityStreams.transformer;
    }
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const obj = this.transformer.transform({value});

    if (!obj) {
      throw new BadRequestException('Type not specified or supported');
    }

    const errors = await validate(obj);

    if (errors.length) {
      throw new BadRequestException(errors.reduce((prev: string[], error: ValidationError) => {
        return prev.concat(error.constraints ? Object.values(error.constraints) : []);
      }, []).join(', '));
    }

    return obj;
  }
}
