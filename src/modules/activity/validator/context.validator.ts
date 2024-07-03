import { ASContext } from '@yuforium/activity-streams';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'context', async: false })
export class ContextValidator implements ValidatorConstraintInterface {
  /**
   * Validate the `@context` property of an ActivityStreams object
   * @param atContext The `@context` value to validate
   * @param _args The validation arguments
   * @returns `true` if the `@context` is valid, `false` otherwise
   */
  validate(atContext: ASContext, _args: ValidationArguments) {
    if (typeof atContext === 'string') {
      return true;
    }

    return Object.entries(atContext).every(([key, val]) => {
      typeof val === 'string' && typeof key === 'string';
    });
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return 'The context must be a string or an object with string values';
  }
}
