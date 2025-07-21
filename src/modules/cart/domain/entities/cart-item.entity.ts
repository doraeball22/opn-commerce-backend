import { ProductId } from '../value-objects/product-id.vo';
import { Quantity } from '../value-objects/quantity.vo';
import { Money } from '../value-objects/money.vo';

export class CartItem {
  private constructor(
    private readonly productId: ProductId,
    private quantity: Quantity,
    private readonly unitPrice: Money,
    private isFreebie: boolean = false,
    private freebieSource?: ProductId,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  static create(
    productId: string,
    quantity: number,
    unitPrice: Money,
  ): CartItem {
    return new CartItem(
      ProductId.create(productId),
      Quantity.create(quantity),
      unitPrice,
    );
  }

  static createFreebie(
    productId: string,
    quantity: number,
    unitPrice: Money,
    source: string,
  ): CartItem {
    return new CartItem(
      ProductId.create(productId),
      Quantity.create(quantity),
      unitPrice,
      true,
      ProductId.create(source),
    );
  }

  private validate(): void {
    if (!this.quantity.isPositive()) {
      throw new Error('Cart item quantity must be positive');
    }

    if (
      this.unitPrice.isLessThan(Money.create(0, this.unitPrice.getCurrency()))
    ) {
      throw new Error('Unit price cannot be negative');
    }

    if (this.isFreebie && !this.freebieSource) {
      throw new Error('Freebie items must have a source product');
    }

    if (!this.isFreebie && this.freebieSource) {
      throw new Error('Non-freebie items cannot have a source product');
    }
  }

  // Getters
  getProductId(): ProductId {
    return this.productId;
  }

  getQuantity(): Quantity {
    return this.quantity;
  }

  getUnitPrice(): Money {
    return this.unitPrice;
  }

  getIsFreebie(): boolean {
    return this.isFreebie;
  }

  getFreebieSource(): ProductId | undefined {
    return this.freebieSource;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateQuantity(newQuantity: Quantity): void {
    if (!newQuantity.isPositive()) {
      throw new Error('Quantity must be positive');
    }

    this.quantity = newQuantity;
    this.updatedAt = new Date();
  }

  addQuantity(additionalQuantity: Quantity): void {
    this.quantity = this.quantity.add(additionalQuantity);
    this.updatedAt = new Date();
  }

  markAsFreebie(source: ProductId): void {
    if (this.isFreebie) {
      throw new Error('Item is already marked as freebie');
    }

    this.isFreebie = true;
    this.freebieSource = source;
    this.updatedAt = new Date();
  }

  removeFreebieMark(): void {
    if (!this.isFreebie) {
      throw new Error('Item is not a freebie');
    }

    this.isFreebie = false;
    this.freebieSource = undefined;
    this.updatedAt = new Date();
  }

  // Calculations
  getLineTotal(): Money {
    if (this.isFreebie) {
      return Money.create(0, this.unitPrice.getCurrency());
    }

    return this.unitPrice.multiply(this.quantity.getValue());
  }

  getLineTotalWithFreebies(): Money {
    // Always calculate based on unit price and quantity, regardless of freebie status
    return this.unitPrice.multiply(this.quantity.getValue());
  }

  // Comparison
  equals(other: CartItem): boolean {
    return (
      this.productId.equals(other.productId) &&
      this.quantity.equals(other.quantity) &&
      this.unitPrice.equals(other.unitPrice) &&
      this.isFreebie === other.isFreebie &&
      ((this.freebieSource &&
        other.freebieSource &&
        this.freebieSource.equals(other.freebieSource)) ||
        (!this.freebieSource && !other.freebieSource))
    );
  }

  // Display
  toString(): string {
    const freebieText = this.isFreebie
      ? ` (FREE - from ${this.freebieSource?.getValue()})`
      : '';
    return `${this.productId.getValue()} x${this.quantity.getValue()} @ ${this.unitPrice.toString()}${freebieText}`;
  }

  // Serialization
  toJSON(): {
    productId: string;
    quantity: number;
    unitPrice: { amount: number; currency: string };
    isFreebie: boolean;
    freebieSource?: string;
    lineTotal: { amount: number; currency: string };
    createdAt: string;
    updatedAt: string;
  } {
    return {
      productId: this.productId.getValue(),
      quantity: this.quantity.getValue(),
      unitPrice: this.unitPrice.toJSON() as {
        amount: number;
        currency: string;
      },
      isFreebie: this.isFreebie,
      freebieSource: this.freebieSource?.getValue(),
      lineTotal: this.getLineTotal().toJSON() as {
        amount: number;
        currency: string;
      },
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromJSON(data: {
    productId: string;
    quantity: number;
    unitPrice: { amount: number; currency: string };
    isFreebie: boolean;
    freebieSource?: string;
    createdAt: string;
    updatedAt: string;
  }): CartItem {
    const item = new CartItem(
      ProductId.create(data.productId),
      Quantity.create(data.quantity),
      Money.create(data.unitPrice.amount, data.unitPrice.currency),
      data.isFreebie,
      data.freebieSource ? ProductId.create(data.freebieSource) : undefined,
      new Date(data.createdAt),
      new Date(data.updatedAt),
    );

    return item;
  }
}
