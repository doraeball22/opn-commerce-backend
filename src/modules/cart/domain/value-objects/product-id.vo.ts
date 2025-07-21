export class ProductId {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): ProductId {
    return new ProductId(value);
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Product ID must be a non-empty string');
    }

    if (value.trim().length === 0) {
      throw new Error('Product ID cannot be empty or whitespace');
    }

    if (value.length > 100) {
      throw new Error('Product ID cannot exceed 100 characters');
    }

    // Basic format validation - alphanumeric, hyphens, underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error(
        'Product ID can only contain letters, numbers, hyphens, and underscores',
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  // For use as Map key
  valueOf(): string {
    return this.value;
  }
}
