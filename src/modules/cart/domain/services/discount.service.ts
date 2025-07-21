import { Injectable } from '@nestjs/common';
import { Money } from '../value-objects/money.vo';
import { Discount } from '../value-objects/discount.vo';
import { DiscountType } from '../types/discount.types';

@Injectable()
export class DiscountService {
  /**
   * Calculate fixed amount discount
   * @param subtotal - Cart subtotal
   * @param amount - Fixed discount amount
   * @returns Calculated discount amount
   */
  calculateFixedDiscount(subtotal: Money, amount: number): Money {
    if (subtotal.isZero()) {
      return Money.create(0, subtotal.getCurrency());
    }

    if (amount <= 0) {
      throw new Error('Discount amount must be positive');
    }

    const discountAmount = Money.create(amount, subtotal.getCurrency());

    // Cannot discount more than the subtotal
    return discountAmount.isGreaterThan(subtotal) ? subtotal : discountAmount;
  }

  /**
   * Calculate percentage discount with optional maximum cap
   * @param subtotal - Cart subtotal
   * @param percentage - Discount percentage (0-100)
   * @param maxAmount - Optional maximum discount amount
   * @returns Calculated discount amount
   */
  calculatePercentageDiscount(
    subtotal: Money,
    percentage: number,
    maxAmount?: number,
  ): Money {
    if (subtotal.isZero()) {
      return Money.create(0, subtotal.getCurrency());
    }

    if (percentage <= 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }

    let discountAmount = subtotal.percentage(percentage);

    // Apply maximum cap if specified
    if (maxAmount !== undefined) {
      if (maxAmount <= 0) {
        throw new Error('Maximum discount amount must be positive');
      }

      const maxDiscount = Money.create(maxAmount, subtotal.getCurrency());
      if (discountAmount.isGreaterThan(maxDiscount)) {
        discountAmount = maxDiscount;
      }
    }

    // Cannot discount more than the subtotal
    return discountAmount.isGreaterThan(subtotal) ? subtotal : discountAmount;
  }

  /**
   * Calculate total discount from multiple discount objects
   * @param subtotal - Cart subtotal
   * @param discounts - Array of discount objects
   * @returns Total discount amount
   */
  calculateTotalDiscount(subtotal: Money, discounts: Discount[]): Money {
    if (subtotal.isZero() || discounts.length === 0) {
      return Money.create(0, subtotal.getCurrency());
    }

    let totalDiscount = Money.create(0, subtotal.getCurrency());
    let remainingSubtotal = subtotal;

    // Apply discounts sequentially
    for (const discount of discounts) {
      if (remainingSubtotal.isZero()) {
        break;
      }

      const discountAmount = discount.calculateDiscount(remainingSubtotal);
      totalDiscount = totalDiscount.add(discountAmount);

      try {
        remainingSubtotal = remainingSubtotal.subtract(discountAmount);
      } catch {
        // If discount exceeds remaining subtotal, set to zero
        remainingSubtotal = Money.create(0, subtotal.getCurrency());
        break;
      }
    }

    return totalDiscount;
  }

  /**
   * Validate discount configuration
   * @param discount - Discount to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateDiscount(discount: Discount): string[] {
    const errors: string[] = [];

    try {
      // Basic validation is done in Discount constructor
      if (!discount.isValid()) {
        errors.push('Discount configuration is invalid');
      }

      // Additional business validation
      if (discount.getType() === DiscountType.PERCENTAGE) {
        const percentage = discount.getAmount();
        const maxAmount = discount.getMaxAmount();

        if (percentage >= 100) {
          errors.push('Percentage discount cannot be 100% or more');
        }

        if (maxAmount !== undefined && maxAmount <= 0) {
          errors.push('Maximum discount amount must be positive');
        }
      }

      if (discount.getType() === DiscountType.FIXED) {
        const amount = discount.getAmount();

        if (amount <= 0) {
          errors.push('Fixed discount amount must be positive');
        }

        if (amount > 1000000) {
          errors.push('Fixed discount amount is unreasonably large');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Discount validation failed: ${message}`);
    }

    return errors;
  }

  /**
   * Create a fixed discount with validation
   * @param name - Discount name
   * @param amount - Fixed discount amount
   * @returns Created discount object
   */
  createFixedDiscount(name: string, amount: number): Discount {
    const discount = Discount.createFixed(name, amount);
    const errors = this.validateDiscount(discount);

    if (errors.length > 0) {
      throw new Error(`Invalid discount: ${errors.join(', ')}`);
    }

    return discount;
  }

  /**
   * Create a percentage discount with validation
   * @param name - Discount name
   * @param percentage - Discount percentage
   * @param maxAmount - Optional maximum discount amount
   * @returns Created discount object
   */
  createPercentageDiscount(
    name: string,
    percentage: number,
    maxAmount?: number,
  ): Discount {
    const discount = Discount.createPercentage(name, percentage, maxAmount);
    const errors = this.validateDiscount(discount);

    if (errors.length > 0) {
      throw new Error(`Invalid discount: ${errors.join(', ')}`);
    }

    return discount;
  }

  /**
   * Check if two discounts can be stacked (applied together)
   * @param discount1 - First discount
   * @param discount2 - Second discount
   * @returns True if discounts can be stacked
   */
  canStackDiscounts(discount1: Discount, discount2: Discount): boolean {
    // For this implementation, we don't allow stacking discounts with the same name
    if (discount1.getName() === discount2.getName()) {
      return false;
    }

    // Additional business rules can be added here
    // For example: only one percentage discount allowed, etc.

    return true;
  }

  /**
   * Get discount information for display
   * @param discount - Discount object
   * @param subtotal - Cart subtotal for calculation
   * @returns Discount information object
   */
  getDiscountInfo(
    discount: Discount,
    subtotal: Money,
  ): {
    name: string;
    type: string;
    description: string;
    calculatedAmount: Money;
    savings: string;
  } {
    const calculatedAmount = discount.calculateDiscount(subtotal);
    const savingsPercentage = subtotal.isZero()
      ? 0
      : (calculatedAmount.getAmount() / subtotal.getAmount()) * 100;

    return {
      name: discount.getName(),
      type: discount.getType(),
      description: discount.toString(),
      calculatedAmount,
      savings: `${savingsPercentage.toFixed(1)}%`,
    };
  }
}
