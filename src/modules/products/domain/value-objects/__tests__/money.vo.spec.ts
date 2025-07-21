import { Money } from '../money.vo';

describe('Money Value Object', () => {
  describe('create', () => {
    it('should create money with valid amount and currency', () => {
      const money = Money.create(1000, 'THB');
      expect(money.getAmount()).toBe(1000);
      expect(money.getCurrency()).toBe('THB');
    });

    it('should default to THB currency', () => {
      const money = Money.create(1000);
      expect(money.getCurrency()).toBe('THB');
    });

    it('should throw error for negative amount', () => {
      expect(() => Money.create(-100, 'THB')).toThrow('Money amount cannot be negative');
    });

    it('should throw error for invalid currency', () => {
      expect(() => Money.create(1000, 'INVALID')).toThrow('Currency must be a 3-letter ISO code');
    });

    it('should handle zero amount', () => {
      const money = Money.create(0, 'USD');
      expect(money.getAmount()).toBe(0);
    });

    it('should handle decimal amounts', () => {
      const money = Money.create(99.99, 'USD');
      expect(money.getAmount()).toBe(99.99);
    });
  });

  describe('fromString', () => {
    it('should parse valid money string with default currency', () => {
      const money = Money.fromString('1000');
      expect(money.getAmount()).toBe(1000);
      expect(money.getCurrency()).toBe('THB');
    });

    it('should parse money string with specified currency', () => {
      const money = Money.fromString('99.99', 'USD');
      expect(money.getAmount()).toBe(99.99);
      expect(money.getCurrency()).toBe('USD');
    });

    it('should throw error for invalid format', () => {
      expect(() => Money.fromString('invalid')).toThrow('Invalid money amount format');
      expect(() => Money.fromString('')).toThrow('Invalid money amount format');
      expect(() => Money.fromString('abc')).toThrow('Invalid money amount format');
    });
  });

  describe('arithmetic operations', () => {
    it('should add money with same currency', () => {
      const money1 = Money.create(1000, 'THB');
      const money2 = Money.create(500, 'THB');
      const result = money1.add(money2);

      expect(result.getAmount()).toBe(1500);
      expect(result.getCurrency()).toBe('THB');
    });

    it('should subtract money with same currency', () => {
      const money1 = Money.create(1000, 'THB');
      const money2 = Money.create(300, 'THB');
      const result = money1.subtract(money2);

      expect(result.getAmount()).toBe(700);
      expect(result.getCurrency()).toBe('THB');
    });

    it('should multiply money by factor', () => {
      const money = Money.create(100, 'THB');
      const result = money.multiply(3);

      expect(result.getAmount()).toBe(300);
      expect(result.getCurrency()).toBe('THB');
    });

    it('should divide money by factor', () => {
      const money = Money.create(300, 'THB');
      const result = money.divide(3);

      expect(result.getAmount()).toBe(100);
      expect(result.getCurrency()).toBe('THB');
    });

    it('should throw error when adding different currencies', () => {
      const money1 = Money.create(1000, 'THB');
      const money2 = Money.create(500, 'USD');

      expect(() => money1.add(money2)).toThrow('Cannot operate on different currencies: THB and USD');
    });

    it('should throw error when subtracting results in negative', () => {
      const money1 = Money.create(100, 'THB');
      const money2 = Money.create(200, 'THB');

      expect(() => money1.subtract(money2)).toThrow('Money amount cannot be negative after subtraction');
    });
  });

  describe('comparison operations', () => {
    it('should compare money with same currency', () => {
      const money1 = Money.create(1000, 'THB');
      const money2 = Money.create(500, 'THB');
      const money3 = Money.create(1000, 'THB');

      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isLessThan(money1)).toBe(true);
      expect(money1.equals(money3)).toBe(true);
      expect(money1.isGreaterThanOrEqual(money3)).toBe(true);
      expect(money2.isLessThanOrEqual(money1)).toBe(true);
    });

    it('should throw error when comparing different currencies', () => {
      const money1 = Money.create(1000, 'THB');
      const money2 = Money.create(500, 'USD');

      expect(() => money1.isGreaterThan(money2)).toThrow('Cannot operate on different currencies: THB and USD');
    });
  });

  describe('display methods', () => {
    it('should format THB currency correctly', () => {
      const money = Money.create(1234.56, 'THB');
      expect(money.toDisplayString()).toBe('฿1,234.56');
    });

    it('should format USD currency correctly', () => {
      const money = Money.create(1234.56, 'USD');
      expect(money.toDisplayString()).toBe('$1,234.56');
    });

    it('should format EUR currency correctly', () => {
      const money = Money.create(1234.56, 'EUR');
      expect(money.toDisplayString()).toBe('€1,234.56');
    });

    it('should format zero amount correctly', () => {
      const money = Money.create(0, 'THB');
      expect(money.toDisplayString()).toBe('฿0.00');
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const money = Money.create(1000, 'THB');
      expect(money.toString()).toBe('1000.00 THB');
    });
  });

  describe('static methods', () => {
    it('should create zero money', () => {
      const zero = Money.zero('USD');
      expect(zero.getAmount()).toBe(0);
      expect(zero.getCurrency()).toBe('USD');
    });

    it('should return minimum of two money objects', () => {
      const money1 = Money.create(1000, 'THB');
      const money2 = Money.create(500, 'THB');
      const min = Money.min(money1, money2);

      expect(min.equals(money2)).toBe(true);
    });

    it('should return maximum of two money objects', () => {
      const money1 = Money.create(1000, 'THB');
      const money2 = Money.create(500, 'THB');
      const max = Money.max(money1, money2);

      expect(max.equals(money1)).toBe(true);
    });
  });
});