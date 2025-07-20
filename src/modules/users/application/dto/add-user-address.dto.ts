import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { AddressType } from '../../domain/entities/user-address.entity';

export class AddUserAddressDto {
  @ApiProperty({
    type: AddressDto,
    description: 'Address details',
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
    enum: AddressType,
    example: AddressType.HOME,
    description: 'Type of address',
  })
  @IsEnum(AddressType, {
    message: 'Type must be one of: HOME, WORK, BILLING, SHIPPING, OTHER',
  })
  type: AddressType;

  @ApiProperty({
    example: 'Home Address',
    description: 'Label for the address',
  })
  @IsString()
  @IsNotEmpty({ message: 'Label is required' })
  @Length(1, 50, { message: 'Label must be between 1 and 50 characters' })
  label: string;

  @ApiProperty({
    example: false,
    description: 'Whether this should be the default address',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}
