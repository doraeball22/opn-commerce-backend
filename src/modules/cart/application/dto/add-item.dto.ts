import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: 'product-123',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product to add',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
