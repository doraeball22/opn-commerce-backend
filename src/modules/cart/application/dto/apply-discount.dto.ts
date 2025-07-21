import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyFixedDiscountDto {
  @ApiProperty({
    description: 'Name of the discount',
    example: 'SAVE50',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Fixed discount amount',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class ApplyPercentageDiscountDto {
  @ApiProperty({
    description: 'Name of the discount',
    example: '10PERCENT',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Percentage discount (0-100)',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsPositive()
  percentage: number;

  @ApiProperty({
    description: 'Maximum discount amount (optional)',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAmount?: number;
}
