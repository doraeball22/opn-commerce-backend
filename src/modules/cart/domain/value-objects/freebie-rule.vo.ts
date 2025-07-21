import { ProductId } from './product-id.vo';
import { Quantity } from './quantity.vo';

export class FreebieRule {
  private constructor(
    private readonly name: string,
    private readonly triggerProductId: ProductId,
    private readonly freebieProductId: ProductId,
    private readonly freebieQuantity: Quantity,
  ) {
    this.validate();
  }

  static create(
    name: string,
    triggerProductId: string,
    freebieProductId: string,
    freebieQuantity: number = 1,
  ): FreebieRule {
    return new FreebieRule(
      name,
      ProductId.create(triggerProductId),
      ProductId.create(freebieProductId),
      Quantity.create(freebieQuantity),
    );
  }

  private validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Freebie rule name must be a non-empty string');
    }

    if (this.name.trim().length === 0) {
      throw new Error('Freebie rule name cannot be empty or whitespace');
    }

    if (this.name.length > 100) {
      throw new Error('Freebie rule name cannot exceed 100 characters');
    }

    if (this.triggerProductId.equals(this.freebieProductId)) {
      throw new Error('Trigger product and freebie product cannot be the same');
    }

    if (!this.freebieQuantity.isPositive()) {
      throw new Error('Freebie quantity must be positive');
    }
  }

  getName(): string {
    return this.name;
  }

  getTriggerProductId(): ProductId {
    return this.triggerProductId;
  }

  getFreebieProductId(): ProductId {
    return this.freebieProductId;
  }

  getFreebieQuantity(): Quantity {
    return this.freebieQuantity;
  }

  equals(other: FreebieRule): boolean {
    return (
      this.name === other.name &&
      this.triggerProductId.equals(other.triggerProductId) &&
      this.freebieProductId.equals(other.freebieProductId) &&
      this.freebieQuantity.equals(other.freebieQuantity)
    );
  }

  toString(): string {
    return `${this.name}: Buy ${this.triggerProductId.getValue()} get ${this.freebieQuantity.getValue()} x ${this.freebieProductId.getValue()} free`;
  }

  toJSON(): {
    name: string;
    triggerProductId: string;
    freebieProductId: string;
    freebieQuantity: number;
  } {
    return {
      name: this.name,
      triggerProductId: this.triggerProductId.getValue(),
      freebieProductId: this.freebieProductId.getValue(),
      freebieQuantity: this.freebieQuantity.getValue(),
    };
  }

  static fromJSON(data: {
    name: string;
    triggerProductId: string;
    freebieProductId: string;
    freebieQuantity: number;
  }): FreebieRule {
    return new FreebieRule(
      data.name,
      ProductId.create(data.triggerProductId),
      ProductId.create(data.freebieProductId),
      Quantity.create(data.freebieQuantity),
    );
  }
}
