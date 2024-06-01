import { BadRequestException, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { ActivityStreams } from '@yuforium/activity-streams';
import { ClassTransformOptions, TransformationType } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class ActivityStreamsPipe<T> implements PipeTransform {
  protected allowedTypes: string[] = [];
  // protected transformer: Function;

  constructor(@Optional() protected transformer: ActivityStreams.Transformer, protected classTransformOptions: ClassTransformOptions = {}) {
    this.classTransformOptions = Object.assign({excludeExtraneousValues: true}, classTransformOptions);

    if (this.transformer === undefined) {
      this.transformer = new ActivityStreams.Transformer(undefined, {convertTextToLinks: false});
    }
  }

  async transform(value: any): Promise<T> {
    const obj = this.transformer.transform({value, type: TransformationType.PLAIN_TO_CLASS, key: '', obj: null, options: this.classTransformOptions});

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
