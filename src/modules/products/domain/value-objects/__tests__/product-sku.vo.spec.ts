import { ProductSku } from '../product-sku.vo';

describe('ProductSku Value Object', () => {
  describe('create', () => {
    it('should create SKU with valid value', () => {
      const sku = ProductSku.create('PROD-001');
      expect(sku.getValue()).toBe('PROD-001');
    });

    it('should normalize SKU to uppercase', () => {
      const sku = ProductSku.create('prod-001');
      expect(sku.getValue()).toBe('PROD-001');
    });

    it('should trim whitespace', () => {
      const sku = ProductSku.create('  PROD-001  ');
      expect(sku.getValue()).toBe('PROD-001');
    });

    it('should throw error for empty SKU', () => {
      expect(() => ProductSku.create('')).toThrow(
        'SKU must be a non-empty string',
      );
      expect(() => ProductSku.create('   ')).toThrow(
        'SKU must be a non-empty string',
      );
    });

    it('should throw error for SKU exceeding max length', () => {
      const longSku = 'A'.repeat(51);
      expect(() => ProductSku.create(longSku)).toThrow(
        'SKU must be no more than 50 characters long',
      );
    });

    it('should throw error for invalid characters', () => {
      expect(() => ProductSku.create('PROD@001')).toThrow(
        'SKU must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with special characters',
      );
      expect(() => ProductSku.create('PROD 001')).toThrow(
        'SKU must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with special characters',
      );
      expect(() => ProductSku.create('PROD#001')).toThrow(
        'SKU must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with special characters',
      );
    });

    it('should allow valid characters', () => {
      expect(() => ProductSku.create('PROD-001')).not.toThrow();
      expect(() => ProductSku.create('PROD_001')).not.toThrow();
      expect(() => ProductSku.create('PROD001')).not.toThrow();
      expect(() => ProductSku.create('123-ABC')).not.toThrow();
    });
  });

  describe('generate', () => {
    it('should generate SKU with default prefix', () => {
      const sku = ProductSku.generate();
      expect(sku.getValue()).toMatch(/^SKU-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate SKU with custom prefix', () => {
      const sku = ProductSku.generate('PROD');
      expect(sku.getValue()).toMatch(/^PROD-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate unique SKUs', () => {
      const sku1 = ProductSku.generate();
      const sku2 = ProductSku.generate();
      expect(sku1.getValue()).not.toBe(sku2.getValue());
    });
  });

  describe('business logic methods', () => {
    it('should identify generated SKUs', () => {
      const generated = ProductSku.generate('PROD');
      const manual = ProductSku.create('MANUAL-001');

      expect(generated.isGenerated()).toBe(true);
      expect(manual.isGenerated()).toBe(false);
    });

    it('should identify custom SKUs', () => {
      const generated = ProductSku.generate();
      const custom = ProductSku.create('CUSTOM-SKU');

      expect(generated.isCustom()).toBe(false);
      expect(custom.isCustom()).toBe(true);
    });

    it('should check if SKU has prefix', () => {
      const sku = ProductSku.create('PROD-001');
      expect(sku.hasPrefix('PROD')).toBe(true);
      expect(sku.hasPrefix('TEST')).toBe(false);
    });

    it('should get prefix from SKU', () => {
      const sku = ProductSku.create('PROD-001-X');
      expect(sku.getPrefix()).toBe('PROD');
    });

    it('should return null for SKU without delimiter', () => {
      const sku = ProductSku.create('PROD001');
      expect(sku.getPrefix()).toBeNull();
    });

    it('should get suffix from SKU', () => {
      const sku = ProductSku.create('PROD-001-SUFFIX');
      expect(sku.getSuffix()).toBe('SUFFIX');
    });

    it('should return null for SKU without suffix', () => {
      const sku = ProductSku.create('PROD001');
      expect(sku.getSuffix()).toBeNull();
    });
  });

  describe('equals', () => {
    it('should return true for equal SKUs', () => {
      const sku1 = ProductSku.create('PROD-001');
      const sku2 = ProductSku.create('PROD-001');
      expect(sku1.equals(sku2)).toBe(true);
    });

    it('should return true for equal SKUs with different cases', () => {
      const sku1 = ProductSku.create('prod-001');
      const sku2 = ProductSku.create('PROD-001');
      expect(sku1.equals(sku2)).toBe(true);
    });

    it('should return false for different SKUs', () => {
      const sku1 = ProductSku.create('PROD-001');
      const sku2 = ProductSku.create('PROD-002');
      expect(sku1.equals(sku2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return SKU value as string', () => {
      const sku = ProductSku.create('PROD-001');
      expect(sku.toString()).toBe('PROD-001');
    });
  });

  describe('validation', () => {
    it('should validate correct SKU format', () => {
      expect(ProductSku.isValid('PROD-001')).toBe(true);
      expect(ProductSku.isValid('ABC_123')).toBe(true);
      expect(ProductSku.isValid('123ABC')).toBe(true);
    });

    it('should reject invalid SKU format', () => {
      expect(ProductSku.isValid('')).toBe(false);
      expect(ProductSku.isValid('PROD@001')).toBe(false);
      expect(ProductSku.isValid('PROD 001')).toBe(false);
      expect(ProductSku.isValid('A'.repeat(51))).toBe(false);
    });
  });
});
