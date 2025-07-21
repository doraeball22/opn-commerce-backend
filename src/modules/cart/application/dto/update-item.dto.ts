import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiProperty({
    description: 'New quantity for the product (absolute update)',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
