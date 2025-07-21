import { ApiProperty } from '@nestjs/swagger';
import { CartSummary } from '../interfaces/cart.service.interface';

export class CartResponseDto {
  @ApiProperty({
    description: 'Cart unique identifier',
    example: 'cart-123',
  })
  cartId: string;

  @ApiProperty({
    description: 'User ID associated with the cart',
    example: 'user-123',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'List of items in the cart',
    isArray: true,
  })
  items: any[];

  @ApiProperty({
    description: 'Regular (non-freebie) items',
    isArray: true,
  })
  regularItems: any[];

  @ApiProperty({
    description: 'Freebie items',
    isArray: true,
  })
  freebieItems: any[];

  @ApiProperty({
    description: 'Subtotal before discounts',
    example: { amount: 850, currency: 'THB' },
  })
  subtotal: any;

  @ApiProperty({
    description: 'Total discount amount',
    example: { amount: 85, currency: 'THB' },
  })
  totalDiscount: any;

  @ApiProperty({
    description: 'Final total amount',
    example: { amount: 765, currency: 'THB' },
  })
  total: any;

  @ApiProperty({
    description: 'Number of unique items',
    example: 3,
  })
  uniqueItemCount: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 7,
  })
  totalItemCount: number;

  @ApiProperty({
    description: 'Whether the cart is empty',
    example: false,
  })
  isEmpty: boolean;

  @ApiProperty({
    description: 'Applied discounts',
    isArray: true,
  })
  discounts: any[];

  @ApiProperty({
    description: 'Applied freebies',
    isArray: true,
  })
  freebies: any[];

  @ApiProperty({
    description: 'Cart creation date',
    example: '2025-01-21T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Cart last update date',
    example: '2025-01-21T10:30:00Z',
  })
  updatedAt: Date;

  static fromCartSummary(
    summary: CartSummary,
    userId?: string,
  ): CartResponseDto {
    return {
      cartId: summary.cartId,
      userId,
      items: summary.items,
      regularItems: summary.regularItems,
      freebieItems: summary.freebieItems,
      subtotal: summary.subtotal,
      totalDiscount: summary.totalDiscount,
      total: summary.total,
      uniqueItemCount: summary.uniqueItemCount,
      totalItemCount: summary.totalItemCount,
      isEmpty: summary.isEmpty,
      discounts: summary.discounts,
      freebies: summary.freebies,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
    };
  }
}
