import { Discount } from '../discount.vo';
import { DiscountType } from '../../types/discount.types';
import { Money } from '../money.vo';

describe('Discount', () => {
  describe('createFixed', () => {
    it('should create a fixed discount', () => {
      const discount = Discount.createFixed('SAVE50', 50);

      expect(discount.getName()).toBe('SAVE50');
      expect(discount.getType()).toBe(DiscountType.FIXED);
      expect(discount.getAmount()).toBe(50);
      expect(discount.getMaxAmount()).toBeUndefined();
    });

    it('should throw error for invalid name', () => {
      expect(() => Discount.createFixed('', 50)).toThrow(
        'Discount name must be a non-empty string',
      );
    });

    it('should throw error for invalid amount', () => {
      expect(() => Discount.createFixed('TEST', 0)).toThrow(
        'Discount amount must be positive',
      );
      expect(() => Discount.createFixed('TEST', -10)).toThrow(
        'Discount amount must be positive',
      );
    });
  });

  describe('createPercentage', () => {
    it('should create a percentage discount without max amount', () => {
      const discount = Discount.createPercentage('10PERCENT', 10);

      expect(discount.getName()).toBe('10PERCENT');
      expect(discount.getType()).toBe(DiscountType.PERCENTAGE);
      expect(discount.getAmount()).toBe(10);
      expect(discount.getMaxAmount()).toBeUndefined();
    });

    it('should create a percentage discount with max amount', () => {
      const discount = Discount.createPercentage('10PERCENT', 10, 100);

      expect(discount.getName()).toBe('10PERCENT');
      expect(discount.getType()).toBe(DiscountType.PERCENTAGE);
      expect(discount.getAmount()).toBe(10);
      expect(discount.getMaxAmount()).toBe(100);
    });

    it('should throw error for invalid percentage', () => {
      expect(() => Discount.createPercentage('TEST', 101)).toThrow(
        'Percentage discount cannot exceed 100%',
      );
      expect(() => Discount.createPercentage('TEST', 0)).toThrow(
        'Discount amount must be positive',
      );
    });

    it('should throw error for invalid max amount', () => {
      expect(() => Discount.createPercentage('TEST', 10, 0)).toThrow(
        'Maximum discount amount must be positive',
      );
      expect(() => Discount.createPercentage('TEST', 10, -5)).toThrow(
        'Maximum discount amount must be positive',
      );
    });
  });

  describe('calculateDiscount', () => {
    describe('fixed discount', () => {
      it('should calculate fixed discount correctly', () => {
        const discount = Discount.createFixed('SAVE50', 50);
        const subtotal = Money.create(200, 'THB');

        const result = discount.calculateDiscount(subtotal);

        expect(result.getAmount()).toBe(50);
        expect(result.getCurrency()).toBe('THB');
      });

      it('should not exceed subtotal amount', () => {
        const discount = Discount.createFixed('SAVE100', 100);
        const subtotal = Money.create(50, 'THB');

        const result = discount.calculateDiscount(subtotal);

        expect(result.getAmount()).toBe(50); // Limited to subtotal
      });

      it('should return zero for zero subtotal', () => {
        const discount = Discount.createFixed('SAVE50', 50);
        const subtotal = Money.create(0, 'THB');

        const result = discount.calculateDiscount(subtotal);

        expect(result.getAmount()).toBe(0);
      });
    });

    describe('percentage discount', () => {
      it('should calculate percentage discount correctly', () => {
        const discount = Discount.createPercentage('10PERCENT', 10);
        const subtotal = Money.create(1000, 'THB');

        const result = discount.calculateDiscount(subtotal);

        expect(result.getAmount()).toBe(100); // 10% of 1000
      });

      it('should apply maximum cap when specified', () => {
        const discount = Discount.createPercentage('10PERCENT', 10, 50);
        const subtotal = Money.create(1000, 'THB');

        const result = discount.calculateDiscount(subtotal);

        expect(result.getAmount()).toBe(50); // Capped at 50
      });

      it('should not apply cap when discount is below maximum', () => {
        const discount = Discount.createPercentage('10PERCENT', 10, 200);
        const subtotal = Money.create(1000, 'THB');

        const result = discount.calculateDiscount(subtotal);

        expect(result.getAmount()).toBe(100); // 10% of 1000, below cap
      });

      it('should not exceed subtotal amount', () => {
        const discount = Discount.createPercentage('50PERCENT', 50);
        const subtotal = Money.create(100, 'THB');

        const result = discount.calculateDiscount(subtotal);

        expect(result.getAmount()).toBe(50); // 50% of 100
      });
    });
  });

  describe('validation', () => {
    it('should validate correctly', () => {
      const validDiscount = Discount.createFixed('VALID', 50);
      expect(validDiscount.isValid()).toBe(true);
    });
  });

  describe('comparison', () => {
    it('should compare discounts correctly', () => {
      const discount1 = Discount.createFixed('SAVE50', 50);
      const discount2 = Discount.createFixed('SAVE50', 50);
      const discount3 = Discount.createFixed('SAVE100', 100);

      expect(discount1.equals(discount2)).toBe(true);
      expect(discount1.equals(discount3)).toBe(false);
    });
  });

  describe('string representation', () => {
    it('should format fixed discount correctly', () => {
      const discount = Discount.createFixed('SAVE50', 50);
      expect(discount.toString()).toBe('SAVE50: ฿50.00 off');
    });

    it('should format percentage discount without max correctly', () => {
      const discount = Discount.createPercentage('10PERCENT', 10);
      expect(discount.toString()).toBe('10PERCENT: 10% off');
    });

    it('should format percentage discount with max correctly', () => {
      const discount = Discount.createPercentage('10PERCENT', 10, 100);
      expect(discount.toString()).toBe('10PERCENT: 10% off (max ฿100.00)');
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const originalDiscount = Discount.createPercentage('TEST', 15, 75);
      const json = originalDiscount.toJSON();
      const restoredDiscount = Discount.fromJSON(json);

      expect(restoredDiscount.equals(originalDiscount)).toBe(true);
    });
  });
});
