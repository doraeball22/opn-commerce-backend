import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({
    example: '123 Main Street',
    description: 'Street address',
  })
  @IsString()
  @IsNotEmpty({ message: 'Street is required' })
  @Length(1, 200, { message: 'Street must be between 1 and 200 characters' })
  street: string;

  @ApiProperty({
    example: 'Bangkok',
    description: 'City name',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @Length(1, 100, { message: 'City must be between 1 and 100 characters' })
  city: string;

  @ApiProperty({
    example: 'Bangkok',
    description: 'State or province name',
  })
  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  @Length(1, 100, { message: 'State must be between 1 and 100 characters' })
  state: string;

  @ApiProperty({
    example: '10110',
    description: 'Postal or ZIP code',
  })
  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  @Length(1, 20, { message: 'Postal code must be between 1 and 20 characters' })
  postalCode: string;

  @ApiProperty({
    example: 'Thailand',
    description: 'Country name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  @Length(1, 100, { message: 'Country must be between 1 and 100 characters' })
  country: string;

  @ApiProperty({
    example: 13.7563,
    description: 'Latitude coordinate for delivery location',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90 degrees' })
  @Max(90, { message: 'Latitude must be between -90 and 90 degrees' })
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({
    example: 100.5018,
    description: 'Longitude coordinate for delivery location',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180 degrees' })
  @Max(180, { message: 'Longitude must be between -180 and 180 degrees' })
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({
    example: 'Ring the doorbell twice, leave at front door if no answer',
    description: 'Special delivery instructions for riders',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, {
    message: 'Delivery instructions must not exceed 500 characters',
  })
  deliveryInstructions?: string;
}
