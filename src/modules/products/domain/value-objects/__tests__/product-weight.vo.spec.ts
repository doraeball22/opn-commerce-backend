import { ProductWeight, WeightUnit } from '../product-weight.vo';

describe('ProductWeight Value Object', () => {
  describe('create', () => {
    it('should create weight with valid value and unit', () => {
      const weight = ProductWeight.create(1000, WeightUnit.GRAMS);
      expect(weight.getValue()).toBe(1000);
      expect(weight.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should default to grams', () => {
      const weight = ProductWeight.create(500);
      expect(weight.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should throw error for negative weight', () => {
      expect(() => ProductWeight.create(-100, WeightUnit.GRAMS)).toThrow('Weight cannot be negative');
    });

    it('should throw error for invalid weight value', () => {
      expect(() => ProductWeight.create(NaN, WeightUnit.GRAMS)).toThrow('Weight value must be a valid number');
      expect(() => ProductWeight.create(Infinity, WeightUnit.GRAMS)).toThrow('Weight must be finite');
    });

    it('should handle zero weight', () => {
      const weight = ProductWeight.create(0, WeightUnit.GRAMS);
      expect(weight.getValue()).toBe(0);
    });
  });

  describe('fromString', () => {
    it('should parse weight string with grams', () => {
      const weight = ProductWeight.fromString('500 g');
      expect(weight.getValue()).toBe(500);
      expect(weight.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should parse weight string with kilograms', () => {
      const weight = ProductWeight.fromString('2.5 kg');
      expect(weight.getValue()).toBe(2.5);
      expect(weight.getUnit()).toBe(WeightUnit.KILOGRAMS);
    });

    it('should parse weight string with pounds', () => {
      const weight = ProductWeight.fromString('10 lb');
      expect(weight.getValue()).toBe(10);
      expect(weight.getUnit()).toBe(WeightUnit.POUNDS);
    });

    it('should throw error for invalid format', () => {
      expect(() => ProductWeight.fromString('invalid')).toThrow('Invalid weight format');
      expect(() => ProductWeight.fromString('100')).toThrow('Invalid weight format');
      expect(() => ProductWeight.fromString('g 100')).toThrow('Invalid weight format');
    });

    it('should throw error for unsupported unit', () => {
      expect(() => ProductWeight.fromString('100 xyz')).toThrow('Invalid weight format. Expected format: "100 g", "1.5 kg", etc.');
    });
  });

  describe('conversions', () => {
    it('should convert grams to kilograms', () => {
      const weight = ProductWeight.create(1000, WeightUnit.GRAMS);
      expect(weight.toKilograms()).toBe(1);
    });

    it('should convert kilograms to grams', () => {
      const weight = ProductWeight.create(1, WeightUnit.KILOGRAMS);
      expect(weight.toGrams()).toBe(1000);
    });

    it('should convert pounds to grams', () => {
      const weight = ProductWeight.create(1, WeightUnit.POUNDS);
      expect(weight.toGrams()).toBeCloseTo(453.592, 3);
    });

    it('should convert ounces to grams', () => {
      const weight = ProductWeight.create(1, WeightUnit.OUNCES);
      expect(weight.toGrams()).toBeCloseTo(28.3495, 4);
    });

    it('should convert between units', () => {
      const weight = ProductWeight.create(1000, WeightUnit.GRAMS);
      const converted = weight.convertTo(WeightUnit.KILOGRAMS);

      expect(converted.getValue()).toBe(1);
      expect(converted.getUnit()).toBe(WeightUnit.KILOGRAMS);
    });

    it('should return same weight when converting to same unit', () => {
      const weight = ProductWeight.create(500, WeightUnit.GRAMS);
      const converted = weight.convertTo(WeightUnit.GRAMS);

      expect(converted).toBe(weight);
    });
  });

  describe('arithmetic operations', () => {
    it('should add weights with same unit', () => {
      const weight1 = ProductWeight.create(500, WeightUnit.GRAMS);
      const weight2 = ProductWeight.create(300, WeightUnit.GRAMS);
      const result = weight1.add(weight2);

      expect(result.getValue()).toBe(800);
      expect(result.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should add weights with different units', () => {
      const weight1 = ProductWeight.create(1, WeightUnit.KILOGRAMS); // 1000g
      const weight2 = ProductWeight.create(500, WeightUnit.GRAMS);   // 500g
      const result = weight1.add(weight2);

      expect(result.getValue()).toBe(1.5); // Result in kg
      expect(result.getUnit()).toBe(WeightUnit.KILOGRAMS);
    });

    it('should subtract weights', () => {
      const weight1 = ProductWeight.create(1000, WeightUnit.GRAMS);
      const weight2 = ProductWeight.create(300, WeightUnit.GRAMS);
      const result = weight1.subtract(weight2);

      expect(result.getValue()).toBe(700);
      expect(result.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should throw error when subtraction results in negative', () => {
      const weight1 = ProductWeight.create(100, WeightUnit.GRAMS);
      const weight2 = ProductWeight.create(200, WeightUnit.GRAMS);

      expect(() => weight1.subtract(weight2)).toThrow('Weight cannot be negative after subtraction');
    });

    it('should multiply weight by factor', () => {
      const weight = ProductWeight.create(100, WeightUnit.GRAMS);
      const result = weight.multiply(3);

      expect(result.getValue()).toBe(300);
      expect(result.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should divide weight by factor', () => {
      const weight = ProductWeight.create(300, WeightUnit.GRAMS);
      const result = weight.divide(3);

      expect(result.getValue()).toBe(100);
      expect(result.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should throw error for negative multiplication factor', () => {
      const weight = ProductWeight.create(100, WeightUnit.GRAMS);
      expect(() => weight.multiply(-2)).toThrow('Cannot multiply weight by negative factor');
    });

    it('should throw error for zero or negative division factor', () => {
      const weight = ProductWeight.create(100, WeightUnit.GRAMS);
      expect(() => weight.divide(0)).toThrow('Cannot divide weight by zero or negative number');
      expect(() => weight.divide(-2)).toThrow('Cannot divide weight by zero or negative number');
    });
  });

  describe('comparison operations', () => {
    it('should compare weights correctly', () => {
      const weight1 = ProductWeight.create(1000, WeightUnit.GRAMS);
      const weight2 = ProductWeight.create(500, WeightUnit.GRAMS);
      const weight3 = ProductWeight.create(1, WeightUnit.KILOGRAMS); // 1000g

      expect(weight1.isGreaterThan(weight2)).toBe(true);
      expect(weight2.isLessThan(weight1)).toBe(true);
      expect(weight1.equals(weight3)).toBe(true);
      expect(weight1.isGreaterThanOrEqual(weight3)).toBe(true);
      expect(weight2.isLessThanOrEqual(weight1)).toBe(true);
    });
  });

  describe('business logic', () => {
    it('should identify lightweight items', () => {
      const light = ProductWeight.create(400, WeightUnit.GRAMS);
      const heavy = ProductWeight.create(600, WeightUnit.GRAMS);

      expect(light.isLightweight()).toBe(true);
      expect(heavy.isLightweight()).toBe(false);
    });

    it('should identify heavy items', () => {
      const light = ProductWeight.create(2, WeightUnit.KILOGRAMS);
      const heavy = ProductWeight.create(6, WeightUnit.KILOGRAMS);

      expect(light.isHeavy()).toBe(false);
      expect(heavy.isHeavy()).toBe(true);
    });

    it('should categorize shipping weights', () => {
      const letter = ProductWeight.create(50, WeightUnit.GRAMS);
      const small = ProductWeight.create(300, WeightUnit.GRAMS);
      const standard = ProductWeight.create(1500, WeightUnit.GRAMS);
      const large = ProductWeight.create(5000, WeightUnit.GRAMS);
      const heavyPackage = ProductWeight.create(15000, WeightUnit.GRAMS);

      expect(letter.getShippingCategory()).toBe('Letter');
      expect(small.getShippingCategory()).toBe('Small Package');
      expect(standard.getShippingCategory()).toBe('Standard Package');
      expect(large.getShippingCategory()).toBe('Large Package');
      expect(heavyPackage.getShippingCategory()).toBe('Heavy Package');
    });
  });

  describe('display methods', () => {
    it('should display weight with unit', () => {
      const weight = ProductWeight.create(1500, WeightUnit.GRAMS);
      expect(weight.toDisplayString()).toBe('1500 g');
    });

    it('should display optimal unit for small weights', () => {
      const weight = ProductWeight.create(500, WeightUnit.GRAMS);
      expect(weight.toDisplayStringOptimal()).toBe('500 g');
    });

    it('should display optimal unit for large weights', () => {
      const weight = ProductWeight.create(2500, WeightUnit.GRAMS);
      expect(weight.toDisplayStringOptimal()).toBe('2.5 kg');
    });
  });

  describe('static methods', () => {
    it('should create zero weight', () => {
      const zero = ProductWeight.zero();
      expect(zero.getValue()).toBe(0);
      expect(zero.getUnit()).toBe(WeightUnit.GRAMS);
    });

    it('should return minimum weight', () => {
      const weight1 = ProductWeight.create(1000, WeightUnit.GRAMS);
      const weight2 = ProductWeight.create(500, WeightUnit.GRAMS);
      const min = ProductWeight.min(weight1, weight2);

      expect(min.equals(weight2)).toBe(true);
    });

    it('should return maximum weight', () => {
      const weight1 = ProductWeight.create(1000, WeightUnit.GRAMS);
      const weight2 = ProductWeight.create(500, WeightUnit.GRAMS);
      const max = ProductWeight.max(weight1, weight2);

      expect(max.equals(weight1)).toBe(true);
    });
  });
});