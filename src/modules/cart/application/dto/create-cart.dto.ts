import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    description: 'User ID to associate the cart with',
    example: 'user-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
