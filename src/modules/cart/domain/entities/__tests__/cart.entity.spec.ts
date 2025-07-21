import { Cart } from '../cart.entity';
import { Money } from '../../value-objects/money.vo';
import { Discount } from '../../value-objects/discount.vo';
import { FreebieRule } from '../../value-objects/freebie-rule.vo';

describe('Cart', () => {
  let cart: Cart;
  const testPrice = Money.create(100, 'THB');

  beforeEach(() => {
    cart = Cart.create();
  });

  describe('creation', () => {
    it('should create a new cart with unique ID', () => {
      const cart1 = Cart.create();
      const cart2 = Cart.create();

      expect(cart1.getId()).toBeDefined();
      expect(cart2.getId()).toBeDefined();
      expect(cart1.getId()).not.toBe(cart2.getId());
    });

    it('should start with empty cart', () => {
      expect(cart.isEmpty()).toBe(true);
      expect(cart.getItems()).toHaveLength(0);
      expect(cart.getUniqueItemCount()).toBe(0);
      expect(cart.getTotalItemCount()).toBe(0);
    });
  });

  describe('basic cart operations', () => {
    describe('addItem', () => {
      it('should add item to cart', () => {
        cart.addItem('product-1', 2, testPrice);

        expect(cart.isEmpty()).toBe(false);
        expect(cart.hasProduct('product-1')).toBe(true);
        expect(cart.getUniqueItemCount()).toBe(1);
        expect(cart.getTotalItemCount()).toBe(2);
      });

      it('should merge quantities when adding same product', () => {
        cart.addItem('product-1', 2, testPrice);
        cart.addItem('product-1', 3, testPrice);

        expect(cart.getUniqueItemCount()).toBe(1);
        expect(cart.getTotalItemCount()).toBe(5);
      });

      it('should add multiple different products', () => {
        cart.addItem('product-1', 2, testPrice);
        cart.addItem('product-2', 1, Money.create(200, 'THB'));

        expect(cart.getUniqueItemCount()).toBe(2);
        expect(cart.getTotalItemCount()).toBe(3);
        expect(cart.hasProduct('product-1')).toBe(true);
        expect(cart.hasProduct('product-2')).toBe(true);
      });
    });

    describe('updateItem', () => {
      it('should update item quantity', () => {
        cart.addItem('product-1', 2, testPrice);
        cart.updateItem('product-1', 5);

        expect(cart.getTotalItemCount()).toBe(5);
      });

      it('should throw error when updating non-existent product', () => {
        expect(() => cart.updateItem('non-existent', 5)).toThrow(
          'Product non-existent not found in cart',
        );
      });

      it('should throw error when updating freebie item', () => {
        // Add regular item and freebie
        cart.addItem('product-1', 1, testPrice);
        const freebieRule = FreebieRule.create(
          'Test',
          'product-1',
          'product-2',
          1,
        );
        cart.applyFreebie(freebieRule);

        expect(() => cart.updateItem('product-2', 5)).toThrow(
          'Cannot update quantity of freebie items directly',
        );
      });
    });

    describe('removeItem', () => {
      it('should remove item from cart', () => {
        cart.addItem('product-1', 2, testPrice);
        cart.removeItem('product-1');

        expect(cart.isEmpty()).toBe(true);
        expect(cart.hasProduct('product-1')).toBe(false);
      });

      it('should throw error when removing non-existent product', () => {
        expect(() => cart.removeItem('non-existent')).toThrow(
          'Product non-existent not found in cart',
        );
      });

      it('should remove associated freebies when trigger product is removed', () => {
        cart.addItem('product-1', 1, testPrice);
        const freebieRule = FreebieRule.create(
          'Test',
          'product-1',
          'product-2',
          1,
        );
        cart.applyFreebie(freebieRule);

        expect(cart.getItems()).toHaveLength(2); // Regular + freebie

        cart.removeItem('product-1');

        expect(cart.getItems()).toHaveLength(0); // Both removed
      });
    });

    describe('clear', () => {
      it('should clear all items, discounts, and freebies', () => {
        cart.addItem('product-1', 2, testPrice);
        cart.applyDiscount(Discount.createFixed('SAVE10', 10));
        cart.applyFreebie(
          FreebieRule.create('Test', 'product-1', 'product-2', 1),
        );

        cart.clear();

        expect(cart.isEmpty()).toBe(true);
        expect(cart.getDiscounts()).toHaveLength(0);
        expect(cart.getFreebieRules()).toHaveLength(0);
      });
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      cart.addItem('product-1', 3, testPrice);
      cart.addItem('product-2', 2, Money.create(200, 'THB'));
    });

    it('should check if product exists', () => {
      expect(cart.hasProduct('product-1')).toBe(true);
      expect(cart.hasProduct('product-3')).toBe(false);
    });

    it('should return correct item counts', () => {
      expect(cart.getUniqueItemCount()).toBe(2);
      expect(cart.getTotalItemCount()).toBe(5);
      expect(cart.isEmpty()).toBe(false);
    });

    it('should list all items', () => {
      const items = cart.getItems();
      expect(items).toHaveLength(2);

      const productIds = items.map((item) => item.getProductId().getValue());
      expect(productIds).toContain('product-1');
      expect(productIds).toContain('product-2');
    });

    it('should separate regular and freebie items', () => {
      const freebieRule = FreebieRule.create(
        'Test',
        'product-1',
        'product-3',
        1,
      );
      cart.applyFreebie(freebieRule);

      expect(cart.getRegularItems()).toHaveLength(2);
      expect(cart.getFreebieItems()).toHaveLength(1);
      expect(cart.getItems()).toHaveLength(3);
    });
  });

  describe('discount management', () => {
    beforeEach(() => {
      cart.addItem('product-1', 1, Money.create(1000, 'THB'));
    });

    it('should apply discount', () => {
      const discount = Discount.createFixed('SAVE100', 100);
      cart.applyDiscount(discount);

      expect(cart.hasDiscount('SAVE100')).toBe(true);
      expect(cart.getDiscounts()).toHaveLength(1);
    });

    it('should throw error when applying duplicate discount', () => {
      const discount = Discount.createFixed('SAVE100', 100);
      cart.applyDiscount(discount);

      expect(() => cart.applyDiscount(discount)).toThrow(
        "Discount 'SAVE100' is already applied",
      );
    });

    it('should remove discount', () => {
      const discount = Discount.createFixed('SAVE100', 100);
      cart.applyDiscount(discount);
      cart.removeDiscount('SAVE100');

      expect(cart.hasDiscount('SAVE100')).toBe(false);
      expect(cart.getDiscounts()).toHaveLength(0);
    });

    it('should throw error when removing non-existent discount', () => {
      expect(() => cart.removeDiscount('NON_EXISTENT')).toThrow(
        "Discount 'NON_EXISTENT' not found",
      );
    });
  });

  describe('freebie management', () => {
    beforeEach(() => {
      cart.addItem('product-1', 1, testPrice);
    });

    it('should apply freebie rule', () => {
      const rule = FreebieRule.create(
        'Test Freebie',
        'product-1',
        'product-2',
        1,
      );
      cart.applyFreebie(rule);

      expect(cart.getFreebieRules()).toHaveLength(1);
      expect(cart.getFreebieItems()).toHaveLength(1);
      expect(cart.hasProduct('product-2')).toBe(true);
    });

    it('should not add freebie if trigger product not in cart', () => {
      const rule = FreebieRule.create(
        'Test Freebie',
        'product-3',
        'product-2',
        1,
      );
      cart.applyFreebie(rule);

      expect(cart.getFreebieItems()).toHaveLength(0);
      expect(cart.hasProduct('product-2')).toBe(false);
    });

    it('should remove freebie rule and associated items', () => {
      const rule = FreebieRule.create(
        'Test Freebie',
        'product-1',
        'product-2',
        1,
      );
      cart.applyFreebie(rule);

      expect(cart.getFreebieItems()).toHaveLength(1);

      cart.removeFreebie('Test Freebie');

      expect(cart.getFreebieRules()).toHaveLength(0);
      expect(cart.getFreebieItems()).toHaveLength(0);
      expect(cart.hasProduct('product-2')).toBe(false);
    });
  });

  describe('calculations', () => {
    beforeEach(() => {
      cart.addItem('product-1', 2, Money.create(100, 'THB')); // 200 THB
      cart.addItem('product-2', 1, Money.create(300, 'THB')); // 300 THB
      // Total subtotal: 500 THB
    });

    it('should calculate subtotal correctly', () => {
      const subtotal = cart.getSubtotal();
      expect(subtotal.getAmount()).toBe(500);
      expect(subtotal.getCurrency()).toBe('THB');
    });

    it('should calculate discount correctly', () => {
      cart.applyDiscount(Discount.createFixed('SAVE50', 50));

      const totalDiscount = cart.getTotalDiscount();
      expect(totalDiscount.getAmount()).toBe(50);
    });

    it('should calculate total with discount', () => {
      cart.applyDiscount(Discount.createFixed('SAVE50', 50));

      const total = cart.getTotal();
      expect(total.getAmount()).toBe(450); // 500 - 50
    });

    it('should handle multiple discounts', () => {
      cart.applyDiscount(Discount.createFixed('SAVE50', 50));
      cart.applyDiscount(Discount.createPercentage('10PERCENT', 10, 100));

      const totalDiscount = cart.getTotalDiscount();
      expect(totalDiscount.getAmount()).toBe(100); // 50 + 50 (10% of 500 capped at 100)

      const total = cart.getTotal();
      expect(total.getAmount()).toBe(400); // 500 - 100
    });

    it('should return zero total when discounts exceed subtotal', () => {
      cart.applyDiscount(Discount.createFixed('HUGE_DISCOUNT', 1000));

      const total = cart.getTotal();
      expect(total.getAmount()).toBe(0);
    });

    it('should exclude freebies from subtotal calculation', () => {
      const rule = FreebieRule.create('Test', 'product-1', 'product-3', 1);
      cart.applyFreebie(rule);

      // Subtotal should remain 500 even with freebie
      const subtotal = cart.getSubtotal();
      expect(subtotal.getAmount()).toBe(500);
    });
  });

  describe('validation', () => {
    it('should return no errors for valid cart', () => {
      cart.addItem('product-1', 1, testPrice);
      cart.applyDiscount(Discount.createFixed('SAVE10', 10));

      const errors = cart.validate();
      expect(errors).toHaveLength(0);
    });

    it('should detect circular freebie references', () => {
      // FreebieRule prevents circular references during creation
      expect(() =>
        FreebieRule.create('Circular', 'product-1', 'product-1', 1),
      ).toThrow('Trigger product and freebie product cannot be the same');
    });
  });

  describe('serialization', () => {
    it('should serialize cart to JSON correctly', () => {
      cart.addItem('product-1', 2, testPrice);
      cart.applyDiscount(Discount.createFixed('SAVE10', 10));

      const json = cart.toJSON();

      expect(json.id).toBe(cart.getId());
      expect(json.items).toHaveLength(1);
      expect(json.discounts).toHaveLength(1);
      expect(json.subtotal.amount).toBe(200);
      expect(json.totalDiscount.amount).toBe(10);
      expect(json.total.amount).toBe(190);
      expect(json.uniqueItemCount).toBe(1);
      expect(json.totalItemCount).toBe(2);
      expect(json.isEmpty).toBe(false);
    });
  });
});
