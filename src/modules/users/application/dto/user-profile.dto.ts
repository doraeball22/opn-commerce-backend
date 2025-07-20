import { ApiProperty } from '@nestjs/swagger';

class AddressResponseDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  street: string;

  @ApiProperty({ description: 'City', example: 'Bangkok' })
  city: string;

  @ApiProperty({ description: 'State/Province', example: 'Bangkok' })
  state: string;

  @ApiProperty({ description: 'Postal code', example: '10110' })
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'Thailand' })
  country: string;
}

export class UserProfileDto {
  @ApiProperty({ description: 'User ID', example: 'user1' })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Calculated age', example: 33 })
  age: number;

  @ApiProperty({
    description: 'Gender',
    example: 'MALE',
    enum: ['MALE', 'FEMALE', 'OTHER'],
  })
  gender: string;

  @ApiProperty({
    description: 'Newsletter subscription status',
    example: true,
  })
  subscribedToNewsletter: boolean;
}
