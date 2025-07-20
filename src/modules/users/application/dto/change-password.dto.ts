import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Custom validator to check if passwords match
export class PasswordsMatchValidator {
  validate(confirmPassword: string, args: any) {
    const object = args.object as ChangePasswordDto;
    return confirmPassword === object.newPassword;
  }

  defaultMessage() {
    return 'Confirm password must match new password';
  }
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentPassword123',
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description:
      'New password (8-50 characters, must contain at least one letter and one number)',
    example: 'newPassword123',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(50, { message: 'New password must not exceed 50 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'New password must contain at least one letter and one number',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match newPassword)',
    example: 'newPassword123',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long',
  })
  @MaxLength(50, { message: 'Confirm password must not exceed 50 characters' })
  @Validate(PasswordsMatchValidator)
  confirmPassword: string;
}
