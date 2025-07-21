export class ProductSku {
  private static readonly SKU_REGEX = /^[A-Z0-9][A-Z0-9\-_]*[A-Z0-9]$/;
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 50;

  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): ProductSku {
    return new ProductSku(value.toUpperCase().trim());
  }

  static generate(prefix?: string): ProductSku {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const sku = prefix
      ? `${prefix}-${timestamp}-${random}`
      : `SKU-${timestamp}-${random}`;
    return new ProductSku(sku);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProductSku): boolean {
    return this.value === other.value;
  }

  // Validation
  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('SKU must be a non-empty string');
    }

    const trimmed = value.trim();

    if (trimmed.length < ProductSku.MIN_LENGTH) {
      throw new Error(
        `SKU must be at least ${ProductSku.MIN_LENGTH} characters long`,
      );
    }

    if (trimmed.length > ProductSku.MAX_LENGTH) {
      throw new Error(
        `SKU must be no more than ${ProductSku.MAX_LENGTH} characters long`,
      );
    }

    if (!ProductSku.SKU_REGEX.test(trimmed)) {
      throw new Error(
        'SKU must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with special characters',
      );
    }
  }

  // Utility methods
  hasPrefix(prefix: string): boolean {
    return this.value.startsWith(prefix.toUpperCase());
  }

  hasSuffix(suffix: string): boolean {
    return this.value.endsWith(suffix.toUpperCase());
  }

  contains(substring: string): boolean {
    return this.value.includes(substring.toUpperCase());
  }

  getPrefix(delimiter: string = '-'): string | null {
    const parts = this.value.split(delimiter);
    return parts.length > 1 ? parts[0] : null;
  }

  getSuffix(delimiter: string = '-'): string | null {
    const parts = this.value.split(delimiter);
    return parts.length > 1 ? parts[parts.length - 1] : null;
  }

  // Business logic
  isGenerated(): boolean {
    // Check if SKU follows the generated pattern
    return (
      this.value.includes('-') &&
      (this.hasPrefix('SKU') ||
        !!this.value.match(/^[A-Z]+-[A-Z0-9]+-[A-Z0-9]+$/))
    );
  }

  isCustom(): boolean {
    return !this.isGenerated();
  }

  // Static validation method
  static isValid(value: string): boolean {
    try {
      new ProductSku(value);
      return true;
    } catch {
      return false;
    }
  }

  static validateUniqueness(sku: ProductSku, existingSkus: ProductSku[]): void {
    const duplicate = existingSkus.find((existing) => existing.equals(sku));
    if (duplicate) {
      throw new Error(`SKU '${sku.getValue()}' already exists`);
    }
  }

  toJSON(): object {
    return {
      value: this.value,
      isGenerated: this.isGenerated(),
      isCustom: this.isCustom(),
    };
  }
}
