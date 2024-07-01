import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export type ContextType = {[k: string]: string};

@ValidatorConstraint({ name: 'context', async: false })
export class ContextValidator implements ValidatorConstraintInterface {
  validate(value: string | ContextType, _args: ValidationArguments) {
    if (typeof value === 'string') {
      return true;
    }

    return Object.keys(value).every(k => typeof value[k] === 'string');
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'The context must be a string or an object with string values';
  }
}
