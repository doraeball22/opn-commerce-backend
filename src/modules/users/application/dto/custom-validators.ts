import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// Custom validator for age validation
@ValidatorConstraint({ name: 'isMinAge', async: false })
export class IsMinAgeConstraint implements ValidatorConstraintInterface {
  validate(dateOfBirth: string, args: ValidationArguments) {
    if (!dateOfBirth) return false;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const minAge = args.constraints[0] || 13;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= minAge;
  }

  defaultMessage(args: ValidationArguments) {
    const minAge = args.constraints[0] || 13;
    return `Age must be at least ${minAge} years old`;
  }
}

export function IsMinAge(
  minAge: number = 13,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge],
      validator: IsMinAgeConstraint,
    });
  };
}

// Custom validator for strong password
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string) {
    if (!password) return false;

    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  defaultMessage() {
    return 'Password must contain at least 8 characters with one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Custom validator for future date prevention
@ValidatorConstraint({ name: 'isNotFutureDate', async: false })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string) {
    if (!dateString) return false;

    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    return inputDate <= today;
  }

  defaultMessage() {
    return 'Date cannot be in the future';
  }
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotFutureDateConstraint,
    });
  };
}
