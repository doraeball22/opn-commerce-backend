import { Product } from '../product.entity';
import { ProductSku } from '../../value-objects/product-sku.vo';
import { Money } from '../../value-objects/money.vo';
import { ProductStatus } from '../../value-objects/product-status.vo';
import {
  ProductWeight,
  WeightUnit,
} from '../../value-objects/product-weight.vo';

describe('Product Entity', () => {
  describe('create', () => {
    it('should create a valid product', () => {
      const product = Product.create(
        'Test Product',
        'test-product',
        'A test product description',
        'Test product',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
        10,
        true,
      );

      expect(product.name).toBe('Test Product');
      expect(product.slug).toBe('test-product');
      expect(product.description).toBe('A test product description');
      expect(product.shortDescription).toBe('Test product');
      expect(product.sku.getValue()).toBe('TEST-001');
      expect(product.price.getAmount()).toBe(1000);
      expect(product.stockQuantity).toBe(10);
      expect(product.manageStock).toBe(true);
      expect(product.isActive()).toBe(false); // Products start as draft by default
    });

    it('should create product with default values', () => {
      const product = Product.create(
        'Simple Product',
        'simple-product',
        'Simple description',
        'Simple',
        ProductSku.create('SIMPLE-001'),
        Money.create(500, 'THB'),
      );

      expect(product.stockQuantity).toBe(0);
      expect(product.manageStock).toBe(true); // defaults to true when not specified
    });
  });

  describe('price management', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );
    });

    it('should update price', () => {
      const newPrice = Money.create(1200, 'THB');
      product.updatePrice(newPrice);

      expect(product.price.getAmount()).toBe(1200);
    });

    it('should set sale price', () => {
      const salePrice = Money.create(800, 'THB');
      product.updatePrice(product.price, salePrice);

      expect(product.salePrice?.getAmount()).toBe(800);
      expect(product.isOnSale()).toBe(true);
    });

    it('should get effective price when no sale', () => {
      const effectivePrice = product.getEffectivePrice();
      expect(effectivePrice.equals(product.price)).toBe(true);
    });

    it('should get effective price when on sale', () => {
      const salePrice = Money.create(800, 'THB');
      product.updatePrice(product.price, salePrice);

      const effectivePrice = product.getEffectivePrice();
      expect(effectivePrice.equals(salePrice)).toBe(true);
    });

    it('should check if on sale', () => {
      const salePrice = Money.create(800, 'THB');
      product.updatePrice(product.price, salePrice);

      expect(product.isOnSale()).toBe(true);
    });

    it('should not be on sale when no sale price', () => {
      expect(product.isOnSale()).toBe(false);
    });
  });

  describe('stock management', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
        10,
        true,
      );
    });

    it('should update stock quantity', () => {
      product.updateStock(15);
      expect(product.stockQuantity).toBe(15);
    });

    it('should throw error for negative stock', () => {
      expect(() => product.updateStock(-5)).toThrow(
        'Stock quantity cannot be negative',
      );
    });

    it('should check if in stock', () => {
      expect(product.isInStock()).toBe(true);

      product.updateStock(0);
      expect(product.isInStock()).toBe(false);
    });

    it('should check if in stock when stock is available', () => {
      expect(product.isInStock()).toBe(true);
    });

    it('should check if out of stock when no stock', () => {
      product.updateStock(0);
      expect(product.isInStock()).toBe(false);
    });

    it('should have manage stock setting', () => {
      expect(product.manageStock).toBe(true);
    });
  });

  describe('status management', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );
    });

    it('should set product status', () => {
      product.setStatus(ProductStatus.draft());
      expect(product.status.toString()).toBe('DRAFT');
      expect(product.isActive()).toBe(false);
    });

    it('should activate product', () => {
      product.setStatus(ProductStatus.draft());
      product.activate();
      expect(product.isActive()).toBe(true);
    });

    it('should deactivate product', () => {
      product.deactivate();
      expect(product.isActive()).toBe(false);
    });

    it('should archive product', () => {
      product.archive();
      expect(product.status.toString()).toBe('ARCHIVED');
    });
  });

  describe('category management', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );
    });

    it('should assign to categories', () => {
      const categoryIds = ['cat1', 'cat2', 'cat3'];
      product.assignToCategories(categoryIds);

      expect(product.categoryIds).toEqual(categoryIds);
    });

    it('should add to category', () => {
      product.addToCategory('cat1');
      product.addToCategory('cat2');

      expect(product.categoryIds).toContain('cat1');
      expect(product.categoryIds).toContain('cat2');
    });

    it('should not add duplicate category', () => {
      product.addToCategory('cat1');
      product.addToCategory('cat1');

      expect(product.categoryIds.length).toBe(1);
      expect(product.categoryIds).toEqual(['cat1']);
    });

    it('should remove from category', () => {
      product.assignToCategories(['cat1', 'cat2', 'cat3']);
      product.removeFromCategory('cat2');

      expect(product.categoryIds).toEqual(['cat1', 'cat3']);
    });

    it('should check if in category', () => {
      product.assignToCategories(['cat1', 'cat2']);

      expect(product.isInCategory('cat1')).toBe(true);
      expect(product.isInCategory('cat3')).toBe(false);
    });

    it('should assign empty categories array', () => {
      product.assignToCategories(['cat1', 'cat2', 'cat3']);
      product.assignToCategories([]);

      expect(product.categoryIds).toEqual([]);
    });
  });

  describe('attributes management', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );
    });

    it('should add attribute', () => {
      product.addAttribute('color', 'red');
      expect(product.getAttribute('color')).toBe('red');
    });

    it('should add array attribute', () => {
      product.addAttribute('sizes', ['S', 'M', 'L']);
      expect(product.getAttribute('sizes')).toEqual(['S', 'M', 'L']);
    });

    it('should remove attribute', () => {
      product.addAttribute('color', 'red');
      product.removeAttribute('color');
      expect(product.getAttribute('color')).toBeUndefined();
    });

    it('should check if has attribute', () => {
      product.addAttribute('color', 'red');
      expect(product.hasAttribute('color')).toBe(true);
      expect(product.hasAttribute('size')).toBe(false);
    });

    it('should store multiple attributes', () => {
      product.addAttribute('color', 'red');
      product.addAttribute('size', 'L');
      expect(product.getAttribute('color')).toBe('red');
      expect(product.getAttribute('size')).toBe('L');
    });
  });

  describe('weight and dimensions', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );
    });

    it('should update weight', () => {
      const weight = ProductWeight.create(500, WeightUnit.GRAMS);
      product.updateWeight(weight);
      expect(product.weight?.getValue()).toBe(500);
    });

    it('should store product weight', () => {
      const weight = ProductWeight.create(2, WeightUnit.KILOGRAMS);
      product.updateWeight(weight);
      expect(product.weight?.getValue()).toBe(2);
      expect(product.weight?.getUnit()).toBe(WeightUnit.KILOGRAMS);
    });
  });

  describe('rating and reviews', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );
    });

    it('should update rating', () => {
      product.updateRating(4.5, 10);
      expect(product.averageRating).toBe(4.5);
      expect(product.reviewCount).toBe(10);
    });

    it('should throw error for invalid rating', () => {
      expect(() => product.updateRating(-1, 10)).toThrow(
        'Average rating must be between 0 and 5',
      );
      expect(() => product.updateRating(6, 10)).toThrow(
        'Average rating must be between 0 and 5',
      );
    });

    it('should throw error for negative review count', () => {
      expect(() => product.updateRating(4.5, -5)).toThrow(
        'Review count cannot be negative',
      );
    });

    it('should have updated rating and review count', () => {
      product.updateRating(4.5, 10);
      expect(product.averageRating).toBe(4.5);
      expect(product.reviewCount).toBe(10);
    });
  });

  describe('deletion and restoration', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );
    });

    it('should soft delete product', () => {
      product.delete();
      expect(product.isDeleted()).toBe(true);
      expect(product.deletedAt).toBeInstanceOf(Date);
    });

    it('should restore deleted product', () => {
      product.delete();
      product.restore();
      expect(product.isDeleted()).toBe(false);
      expect(product.deletedAt).toBeNull();
    });
  });

  describe('lifecycle timestamps', () => {
    it('should set createdAt and updatedAt on creation', () => {
      const product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );

      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt timestamp', () => {
      const product = Product.create(
        'Test Product',
        'test-product',
        'Description',
        'Short desc',
        ProductSku.create('TEST-001'),
        Money.create(1000, 'THB'),
      );

      const originalUpdatedAt = product.updatedAt;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        product.updatePrice(Money.create(1200, 'THB'));
        expect(product.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });
});
