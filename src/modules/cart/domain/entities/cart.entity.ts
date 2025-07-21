import { v4 as uuidv4 } from 'uuid';
import { CartItem } from './cart-item.entity';
import { ProductId } from '../value-objects/product-id.vo';
import { Quantity } from '../value-objects/quantity.vo';
import { Money } from '../value-objects/money.vo';
import { Discount } from '../value-objects/discount.vo';
import { FreebieRule } from '../value-objects/freebie-rule.vo';

export class Cart {
  private constructor(
    private readonly id: string,
    private readonly items: Map<string, CartItem> = new Map(),
    private readonly discounts: Map<string, Discount> = new Map(),
    private readonly freebieRules: Map<string, FreebieRule> = new Map(),
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {}

  static create(): Cart {
    return new Cart(uuidv4());
  }

  static fromData(
    id: string,
    items: Map<string, CartItem>,
    discounts: Map<string, Discount>,
    freebieRules: Map<string, FreebieRule>,
    createdAt: Date,
    updatedAt: Date,
  ): Cart {
    return new Cart(id, items, discounts, freebieRules, createdAt, updatedAt);
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Basic Cart Operations
  addItem(productId: string, quantity: number, unitPrice: Money): void {
    const productIdVo = ProductId.create(productId);
    const quantityVo = Quantity.create(quantity);
    const key = productIdVo.getValue();

    if (this.items.has(key)) {
      // Update existing item
      const existingItem = this.items.get(key)!;
      existingItem.addQuantity(quantityVo);
    } else {
      // Add new item
      const newItem = CartItem.create(productId, quantity, unitPrice);
      this.items.set(key, newItem);
    }

    this.updatedAt = new Date();
    this.evaluateFreebieRules();
  }

  updateItem(productId: string, quantity: number): void {
    const productIdVo = ProductId.create(productId);
    const quantityVo = Quantity.create(quantity);
    const key = productIdVo.getValue();

    const item = this.items.get(key);
    if (!item) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    if (item.getIsFreebie()) {
      throw new Error('Cannot update quantity of freebie items directly');
    }

    item.updateQuantity(quantityVo);
    this.updatedAt = new Date();
    this.evaluateFreebieRules();
  }

  removeItem(productId: string): void {
    const productIdVo = ProductId.create(productId);
    const key = productIdVo.getValue();

    if (!this.items.has(key)) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    this.items.delete(key);
    this.updatedAt = new Date();

    // Remove any freebies that were triggered by this product
    this.removeFreebiesBySource(productIdVo);
    this.evaluateFreebieRules();
  }

  clear(): void {
    this.items.clear();
    this.discounts.clear();
    this.freebieRules.clear();
    this.updatedAt = new Date();
  }

  // Utility Methods
  hasProduct(productId: string): boolean {
    const productIdVo = ProductId.create(productId);
    return this.items.has(productIdVo.getValue());
  }

  isEmpty(): boolean {
    const regularItems = Array.from(this.items.values()).filter(
      (item) => !item.getIsFreebie(),
    );
    return regularItems.length === 0;
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  getRegularItems(): CartItem[] {
    return Array.from(this.items.values()).filter(
      (item) => !item.getIsFreebie(),
    );
  }

  getFreebieItems(): CartItem[] {
    return Array.from(this.items.values()).filter((item) =>
      item.getIsFreebie(),
    );
  }

  getUniqueItemCount(): number {
    return this.getRegularItems().length;
  }

  getTotalItemCount(): number {
    return this.getRegularItems().reduce(
      (total, item) => total + item.getQuantity().getValue(),
      0,
    );
  }

  // Discount Management
  applyDiscount(discount: Discount): void {
    if (this.discounts.has(discount.getName())) {
      throw new Error(`Discount '${discount.getName()}' is already applied`);
    }

    this.discounts.set(discount.getName(), discount);
    this.updatedAt = new Date();
  }

  removeDiscount(name: string): void {
    if (!this.discounts.has(name)) {
      throw new Error(`Discount '${name}' not found`);
    }

    this.discounts.delete(name);
    this.updatedAt = new Date();
  }

  getDiscounts(): Discount[] {
    return Array.from(this.discounts.values());
  }

  hasDiscount(name: string): boolean {
    return this.discounts.has(name);
  }

  // Freebie Management
  applyFreebie(rule: FreebieRule): void {
    if (this.freebieRules.has(rule.getName())) {
      throw new Error(`Freebie rule '${rule.getName()}' is already applied`);
    }

    this.freebieRules.set(rule.getName(), rule);
    this.updatedAt = new Date();
    this.evaluateFreebieRules();
  }

  removeFreebie(name: string): void {
    if (!this.freebieRules.has(name)) {
      throw new Error(`Freebie rule '${name}' not found`);
    }

    const rule = this.freebieRules.get(name)!;
    this.freebieRules.delete(name);

    // Remove the freebie items created by this rule
    this.removeFreebiesBySource(rule.getTriggerProductId());
    this.updatedAt = new Date();
  }

  getFreebieRules(): FreebieRule[] {
    return Array.from(this.freebieRules.values());
  }

  private removeFreebiesBySource(sourceProductId: ProductId): void {
    const itemsToRemove: string[] = [];

    for (const [key, item] of this.items.entries()) {
      if (
        item.getIsFreebie() &&
        item.getFreebieSource()?.equals(sourceProductId)
      ) {
        itemsToRemove.push(key);
      }
    }

    itemsToRemove.forEach((key) => this.items.delete(key));
  }

  private evaluateFreebieRules(): void {
    // Remove existing freebies first
    const regularItems = this.getRegularItems();
    this.items.clear();
    regularItems.forEach((item) => {
      this.items.set(item.getProductId().getValue(), item);
    });

    // Apply active freebie rules
    for (const rule of this.freebieRules.values()) {
      const triggerProductKey = rule.getTriggerProductId().getValue();

      if (this.items.has(triggerProductKey)) {
        const freebieProductKey = rule.getFreebieProductId().getValue();

        // Don't add freebie if it's the same as an existing regular item
        if (!this.hasRegularProduct(freebieProductKey)) {
          const freebieItem = CartItem.createFreebie(
            freebieProductKey,
            rule.getFreebieQuantity().getValue(),
            Money.create(0, 'THB'), // Freebies have zero price
            triggerProductKey,
          );

          this.items.set(freebieProductKey, freebieItem);
        }
      }
    }
  }

  private hasRegularProduct(productId: string): boolean {
    const item = this.items.get(productId);
    return item ? !item.getIsFreebie() : false;
  }

  // Calculations
  getSubtotal(): Money {
    if (this.items.size === 0) {
      return Money.create(0, 'THB');
    }

    const regularItems = this.getRegularItems();
    if (regularItems.length === 0) {
      return Money.create(0, 'THB');
    }

    let subtotal = Money.create(
      0,
      regularItems[0].getUnitPrice().getCurrency(),
    );

    for (const item of regularItems) {
      subtotal = subtotal.add(item.getLineTotal());
    }

    return subtotal;
  }

  getTotalDiscount(): Money {
    const subtotal = this.getSubtotal();
    if (subtotal.isZero()) {
      return Money.create(0, subtotal.getCurrency());
    }

    let totalDiscount = Money.create(0, subtotal.getCurrency());

    for (const discount of this.discounts.values()) {
      const discountAmount = discount.calculateDiscount(subtotal);
      totalDiscount = totalDiscount.add(discountAmount);
    }

    return totalDiscount;
  }

  getTotal(): Money {
    const subtotal = this.getSubtotal();
    const totalDiscount = this.getTotalDiscount();

    try {
      return subtotal.subtract(totalDiscount);
    } catch {
      // If discount exceeds subtotal, return zero
      return Money.create(0, subtotal.getCurrency());
    }
  }

  // Validation
  validate(): string[] {
    const errors: string[] = [];

    // Validate items
    for (const item of this.items.values()) {
      try {
        // CartItem has its own validation in constructor
      } catch (error) {
        errors.push(`Invalid cart item: ${error.message}`);
      }
    }

    // Validate discounts
    for (const discount of this.discounts.values()) {
      if (!discount.isValid()) {
        errors.push(`Invalid discount: ${discount.getName()}`);
      }
    }

    // Validate freebie rules
    for (const rule of this.freebieRules.values()) {
      // Check for circular references
      if (rule.getTriggerProductId().equals(rule.getFreebieProductId())) {
        errors.push(
          `Invalid freebie rule: ${rule.getName()} - product cannot be its own freebie`,
        );
      }
    }

    return errors;
  }

  // Display
  toString(): string {
    const itemCount = this.getUniqueItemCount();
    const totalCount = this.getTotalItemCount();
    const total = this.getTotal();

    return `Cart ${this.id}: ${itemCount} unique items (${totalCount} total), Total: ${total.toString()}`;
  }

  // Serialization
  toJSON(): {
    id: string;
    items: any[];
    discounts: any[];
    freebieRules: any[];
    subtotal: { amount: number; currency: string };
    totalDiscount: { amount: number; currency: string };
    total: { amount: number; currency: string };
    uniqueItemCount: number;
    totalItemCount: number;
    isEmpty: boolean;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      id: this.id,
      items: this.getItems().map((item) => item.toJSON()),
      discounts: this.getDiscounts().map((discount) => discount.toJSON()),
      freebieRules: this.getFreebieRules().map((rule) => rule.toJSON()),
      subtotal: this.getSubtotal().toJSON() as {
        amount: number;
        currency: string;
      },
      totalDiscount: this.getTotalDiscount().toJSON() as {
        amount: number;
        currency: string;
      },
      total: this.getTotal().toJSON() as { amount: number; currency: string },
      uniqueItemCount: this.getUniqueItemCount(),
      totalItemCount: this.getTotalItemCount(),
      isEmpty: this.isEmpty(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
