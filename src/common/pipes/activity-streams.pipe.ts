import { BadRequestException, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { ActivityStreams } from '@yuforium/activity-streams';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class ActivityStreamsPipe<T> implements PipeTransform {
  protected allowedTypes: string[] = [];
  // protected transformer: Function;

  constructor(@Optional() protected transformer: ActivityStreams.Transformer) {
    if (this.transformer === undefined) {
      this.transformer = ActivityStreams.transformer;
    }
  }

  async transform(value: any): Promise<T> {
    const obj = this.transformer.transform({value});

    if (!obj) {
      throw new BadRequestException(`The type "${value.type}" is not supported.`);
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
