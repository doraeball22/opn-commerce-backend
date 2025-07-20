import {
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { AddressType } from '../../domain/entities/user-address.entity';

export class UpdateUserAddressDto {
  @ApiProperty({
    type: AddressDto,
    description: 'Address details',
    required: false,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiProperty({
    enum: AddressType,
    example: AddressType.HOME,
    description: 'Type of address',
    required: false,
  })
  @IsEnum(AddressType, {
    message: 'Type must be one of: HOME, WORK, BILLING, SHIPPING, OTHER',
  })
  @IsOptional()
  type?: AddressType;

  @ApiProperty({
    example: 'Home Address',
    description: 'Label for the address',
    required: false,
  })
  @IsString()
  @Length(1, 50, { message: 'Label must be between 1 and 50 characters' })
  @IsOptional()
  label?: string;
}
