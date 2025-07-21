export enum ProductStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class ProductStatus {
  private constructor(private readonly value: ProductStatusEnum) {}

  static draft(): ProductStatus {
    return new ProductStatus(ProductStatusEnum.DRAFT);
  }

  static active(): ProductStatus {
    return new ProductStatus(ProductStatusEnum.ACTIVE);
  }

  static inactive(): ProductStatus {
    return new ProductStatus(ProductStatusEnum.INACTIVE);
  }

  static archived(): ProductStatus {
    return new ProductStatus(ProductStatusEnum.ARCHIVED);
  }

  static fromString(value: string): ProductStatus {
    const upperValue = value.toUpperCase();
    if (
      !Object.values(ProductStatusEnum).includes(
        upperValue as ProductStatusEnum,
      )
    ) {
      throw new Error(`Invalid product status: ${value}`);
    }
    return new ProductStatus(upperValue as ProductStatusEnum);
  }

  getValue(): ProductStatusEnum {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProductStatus): boolean {
    return this.value === other.value;
  }

  // Status checks
  isDraft(): boolean {
    return this.value === ProductStatusEnum.DRAFT;
  }

  isActive(): boolean {
    return this.value === ProductStatusEnum.ACTIVE;
  }

  isInactive(): boolean {
    return this.value === ProductStatusEnum.INACTIVE;
  }

  isArchived(): boolean {
    return this.value === ProductStatusEnum.ARCHIVED;
  }

  // Business logic
  canBePublished(): boolean {
    return this.isDraft() || this.isInactive();
  }

  canBeDeactivated(): boolean {
    return this.isActive();
  }

  canBeArchived(): boolean {
    return this.isInactive() || this.isActive();
  }

  canBeRestored(): boolean {
    return this.isArchived();
  }

  isPubliclyVisible(): boolean {
    return this.isActive();
  }

  allowsModification(): boolean {
    return !this.isArchived();
  }

  getDisplayName(): string {
    switch (this.value) {
      case ProductStatusEnum.DRAFT:
        return 'Draft';
      case ProductStatusEnum.ACTIVE:
        return 'Active';
      case ProductStatusEnum.INACTIVE:
        return 'Inactive';
      case ProductStatusEnum.ARCHIVED:
        return 'Archived';
      default:
        return this.value;
    }
  }

  getDescription(): string {
    switch (this.value) {
      case ProductStatusEnum.DRAFT:
        return 'Product is being prepared and not visible to customers';
      case ProductStatusEnum.ACTIVE:
        return 'Product is live and available for purchase';
      case ProductStatusEnum.INACTIVE:
        return 'Product is temporarily unavailable but not deleted';
      case ProductStatusEnum.ARCHIVED:
        return 'Product is permanently discontinued';
      default:
        return this.value;
    }
  }

  toJSON(): object {
    return {
      value: this.value,
      displayName: this.getDisplayName(),
      description: this.getDescription(),
    };
  }
}
