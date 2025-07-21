import { Quantity } from '../quantity.vo';

describe('Quantity', () => {
  describe('create', () => {
    it('should create a valid quantity', () => {
      const quantity = Quantity.create(5);
      expect(quantity.getValue()).toBe(5);
    });

    it('should create zero quantity', () => {
      const quantity = Quantity.zero();
      expect(quantity.getValue()).toBe(0);
      expect(quantity.isZero()).toBe(true);
    });

    it('should create one quantity', () => {
      const quantity = Quantity.one();
      expect(quantity.getValue()).toBe(1);
      expect(quantity.isPositive()).toBe(true);
    });

    it('should throw error for negative quantity', () => {
      expect(() => Quantity.create(-1)).toThrow('Quantity cannot be negative');
    });

    it('should throw error for non-integer quantity', () => {
      expect(() => Quantity.create(1.5)).toThrow(
        'Quantity must be a whole number',
      );
    });

    it('should throw error for NaN', () => {
      expect(() => Quantity.create(NaN)).toThrow(
        'Quantity must be a valid number',
      );
    });

    it('should throw error for too large quantity', () => {
      expect(() => Quantity.create(1000000)).toThrow(
        'Quantity cannot exceed 999,999',
      );
    });
  });

  describe('math operations', () => {
    it('should add quantities correctly', () => {
      const qty1 = Quantity.create(3);
      const qty2 = Quantity.create(5);
      const result = qty1.add(qty2);
      expect(result.getValue()).toBe(8);
    });

    it('should subtract quantities correctly', () => {
      const qty1 = Quantity.create(10);
      const qty2 = Quantity.create(3);
      const result = qty1.subtract(qty2);
      expect(result.getValue()).toBe(7);
    });

    it('should throw error when subtraction results in negative', () => {
      const qty1 = Quantity.create(3);
      const qty2 = Quantity.create(5);
      expect(() => qty1.subtract(qty2)).toThrow(
        'Resulting quantity cannot be negative',
      );
    });

    it('should multiply quantity correctly', () => {
      const qty = Quantity.create(4);
      const result = qty.multiply(2.5);
      expect(result.getValue()).toBe(10); // Floor of 4 * 2.5 = 10
    });

    it('should throw error for negative multiplication factor', () => {
      const qty = Quantity.create(5);
      expect(() => qty.multiply(-1)).toThrow(
        'Multiplication factor cannot be negative',
      );
    });
  });

  describe('comparison operations', () => {
    it('should compare quantities correctly', () => {
      const qty1 = Quantity.create(5);
      const qty2 = Quantity.create(5);
      const qty3 = Quantity.create(10);

      expect(qty1.equals(qty2)).toBe(true);
      expect(qty1.equals(qty3)).toBe(false);
      expect(qty1.lessThan(qty3)).toBe(true);
      expect(qty3.greaterThan(qty1)).toBe(true);
    });

    it('should check if quantity is positive', () => {
      const positiveQty = Quantity.create(1);
      const zeroQty = Quantity.zero();

      expect(positiveQty.isPositive()).toBe(true);
      expect(zeroQty.isPositive()).toBe(false);
    });

    it('should check if quantity is zero', () => {
      const zeroQty = Quantity.zero();
      const nonZeroQty = Quantity.create(1);

      expect(zeroQty.isZero()).toBe(true);
      expect(nonZeroQty.isZero()).toBe(false);
    });
  });

  describe('string conversion', () => {
    it('should convert to string correctly', () => {
      const qty = Quantity.create(42);
      expect(qty.toString()).toBe('42');
    });

    it('should return numeric value correctly', () => {
      const qty = Quantity.create(42);
      expect(qty.valueOf()).toBe(42);
    });
  });
});
