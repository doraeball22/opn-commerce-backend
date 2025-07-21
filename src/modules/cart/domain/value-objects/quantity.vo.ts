export class Quantity {
  private constructor(private readonly value: number) {
    this.validate(value);
  }

  static create(value: number): Quantity {
    return new Quantity(value);
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  static one(): Quantity {
    return new Quantity(1);
  }

  private validate(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Quantity must be a valid number');
    }

    if (!Number.isInteger(value)) {
      throw new Error('Quantity must be a whole number');
    }

    if (value < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (value > 999999) {
      throw new Error('Quantity cannot exceed 999,999');
    }
  }

  getValue(): number {
    return this.value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error('Resulting quantity cannot be negative');
    }
    return new Quantity(result);
  }

  multiply(factor: number): Quantity {
    if (typeof factor !== 'number' || isNaN(factor)) {
      throw new Error('Multiplication factor must be a valid number');
    }

    if (factor < 0) {
      throw new Error('Multiplication factor cannot be negative');
    }

    return new Quantity(Math.floor(this.value * factor));
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isPositive(): boolean {
    return this.value > 0;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  greaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  lessThan(other: Quantity): boolean {
    return this.value < other.value;
  }

  toString(): string {
    return this.value.toString();
  }

  valueOf(): number {
    return this.value;
  }
}
