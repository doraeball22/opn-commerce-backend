import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyFreebieDto {
  @ApiProperty({
    description: 'Product ID that triggers the freebie',
    example: 'product-1',
  })
  @IsString()
  triggerProductId: string;

  @ApiProperty({
    description: 'Product ID to be given as freebie',
    example: 'product-3',
  })
  @IsString()
  freebieProductId: string;

  @ApiProperty({
    description: 'Quantity of freebie product (optional, defaults to 1)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;
}
