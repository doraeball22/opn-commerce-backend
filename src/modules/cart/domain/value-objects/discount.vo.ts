import { Money } from './money.vo';
import { DiscountType } from '../types/discount.types';

export class Discount {
  private constructor(
    private readonly name: string,
    private readonly type: DiscountType,
    private readonly amount: number,
    private readonly maxAmount?: number,
  ) {
    this.validate();
  }

  static createFixed(name: string, amount: number): Discount {
    return new Discount(name, DiscountType.FIXED, amount);
  }

  static createPercentage(
    name: string,
    percentage: number,
    maxAmount?: number,
  ): Discount {
    return new Discount(name, DiscountType.PERCENTAGE, percentage, maxAmount);
  }

  private validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Discount name must be a non-empty string');
    }

    if (this.name.trim().length === 0) {
      throw new Error('Discount name cannot be empty or whitespace');
    }

    if (this.name.length > 50) {
      throw new Error('Discount name cannot exceed 50 characters');
    }

    if (typeof this.amount !== 'number' || isNaN(this.amount)) {
      throw new Error('Discount amount must be a valid number');
    }

    if (this.amount <= 0) {
      throw new Error('Discount amount must be positive');
    }

    if (this.type === DiscountType.FIXED) {
      // Fixed discount validation
      if (this.amount > 999999) {
        throw new Error('Fixed discount amount cannot exceed 999,999');
      }
    } else if (this.type === DiscountType.PERCENTAGE) {
      // Percentage discount validation
      if (this.amount > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }

      if (this.maxAmount !== undefined) {
        if (typeof this.maxAmount !== 'number' || isNaN(this.maxAmount)) {
          throw new Error('Maximum discount amount must be a valid number');
        }

        if (this.maxAmount <= 0) {
          throw new Error('Maximum discount amount must be positive');
        }

        if (this.maxAmount > 999999) {
          throw new Error('Maximum discount amount cannot exceed 999,999');
        }
      }
    }
  }

  getName(): string {
    return this.name;
  }

  getType(): DiscountType {
    return this.type;
  }

  getAmount(): number {
    return this.amount;
  }

  getMaxAmount(): number | undefined {
    return this.maxAmount;
  }

  calculateDiscount(subtotal: Money): Money {
    if (subtotal.isZero()) {
      return Money.zero(subtotal.getCurrency());
    }

    let discountAmount: Money;

    if (this.type === DiscountType.FIXED) {
      // Fixed amount discount
      discountAmount = Money.create(this.amount, subtotal.getCurrency());

      // Cannot discount more than the subtotal
      if (discountAmount.isGreaterThan(subtotal)) {
        discountAmount = subtotal;
      }
    } else {
      // Percentage discount
      discountAmount = subtotal.percentage(this.amount);

      // Apply maximum cap if specified
      if (this.maxAmount !== undefined) {
        const maxDiscount = Money.create(
          this.maxAmount,
          subtotal.getCurrency(),
        );
        if (discountAmount.isGreaterThan(maxDiscount)) {
          discountAmount = maxDiscount;
        }
      }

      // Cannot discount more than the subtotal
      if (discountAmount.isGreaterThan(subtotal)) {
        discountAmount = subtotal;
      }
    }

    return discountAmount;
  }

  isValid(): boolean {
    try {
      this.validate();
      return true;
    } catch {
      return false;
    }
  }

  equals(other: Discount): boolean {
    return (
      this.name === other.name &&
      this.type === other.type &&
      this.amount === other.amount &&
      this.maxAmount === other.maxAmount
    );
  }

  toString(): string {
    if (this.type === DiscountType.FIXED) {
      return `${this.name}: ฿${this.amount.toFixed(2)} off`;
    } else {
      const maxText = this.maxAmount
        ? ` (max ฿${this.maxAmount.toFixed(2)})`
        : '';
      return `${this.name}: ${this.amount}% off${maxText}`;
    }
  }

  toJSON(): {
    name: string;
    type: DiscountType;
    amount: number;
    maxAmount?: number;
  } {
    return {
      name: this.name,
      type: this.type,
      amount: this.amount,
      maxAmount: this.maxAmount,
    };
  }

  static fromJSON(data: {
    name: string;
    type: DiscountType;
    amount: number;
    maxAmount?: number;
  }): Discount {
    return new Discount(data.name, data.type, data.amount, data.maxAmount);
  }
}
