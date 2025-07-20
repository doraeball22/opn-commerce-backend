import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsMinAge, IsNotFutureDate } from './custom-validators';
import { AddressDto } from './address.dto';
import { AddressType } from '../../domain/entities/user-address.entity';

export class RegisterUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description:
      'User password (8-50 characters, must contain at least one letter and one number)',
    example: 'password123',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({
    description: 'Full name (2-100 characters)',
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-\.]+$/, {
    message:
      'Name can only contain letters, spaces, hyphens, apostrophes, and dots',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Date of birth (must be at least 13 years old)',
    example: '1990-01-15',
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'Date of birth must be a valid date in YYYY-MM-DD format' },
  )
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsNotFutureDate({ message: 'Date of birth cannot be in the future' })
  @IsMinAge(13, { message: 'You must be at least 13 years old to register' })
  dateOfBirth: string;

  @ApiProperty({
    description: 'Gender',
    example: 'MALE',
    enum: ['MALE', 'FEMALE', 'OTHER'],
  })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Gender must be one of: MALE, FEMALE, OTHER',
  })
  @IsNotEmpty({ message: 'Gender is required' })
  @Transform(({ value }) => value?.toUpperCase())
  gender: string;

  @ApiProperty({
    description: 'Initial address for the user',
    type: AddressDto,
  })
  @ValidateNested({ message: 'Address must be a valid address object' })
  @Type(() => AddressDto)
  @IsNotEmpty({ message: 'Initial address is required' })
  address: AddressDto;

  @ApiProperty({
    enum: AddressType,
    example: AddressType.HOME,
    description: 'Type of the initial address',
    default: AddressType.HOME,
  })
  @IsEnum(AddressType, {
    message:
      'Address type must be one of: HOME, WORK, BILLING, SHIPPING, OTHER',
  })
  @IsOptional()
  @Transform(({ value }) => value || AddressType.HOME)
  addressType?: AddressType = AddressType.HOME;

  @ApiProperty({
    example: 'Home',
    description: 'Label for the initial address',
    default: 'Home',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Address label must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim() || 'Home')
  addressLabel?: string = 'Home';

  @ApiProperty({
    description: 'Newsletter subscription preference',
    example: true,
  })
  @IsBoolean({ message: 'Newsletter subscription must be a boolean value' })
  subscribedToNewsletter: boolean;
}
