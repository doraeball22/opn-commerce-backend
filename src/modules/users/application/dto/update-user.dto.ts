import {
  IsOptional,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsEnum,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ description: 'City', example: 'Bangkok' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'State/Province', example: 'Bangkok' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ description: 'Postal code', example: '10110' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'Thailand' })
  @IsNotEmpty()
  @IsString()
  country: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Date of birth',
    example: '1990-01-15',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Gender',
    example: 'MALE',
    enum: ['MALE', 'FEMALE', 'OTHER'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'gender must be one of: MALE, FEMALE, OTHER',
  })
  gender?: string;

  @ApiProperty({
    description: 'User address',
    type: AddressDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({
    description: 'Newsletter subscription preference',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  subscribedToNewsletter?: boolean;
}
