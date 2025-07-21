import { v4 as uuidv4 } from 'uuid';
import { Money } from '../value-objects/money.vo';
import { ProductStatus } from '../value-objects/product-status.vo';
import { ProductSku } from '../value-objects/product-sku.vo';
import { ProductWeight } from '../value-objects/product-weight.vo';
import { ProductDimensions } from '../value-objects/product-dimensions.vo';

export interface ProductAttributes {
  [key: string]: string | string[];
}

export interface ProductImages {
  featuredImage?: string;
  gallery: string[];
}

export class Product {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _slug: string,
    private _description: string,
    private _shortDescription: string,
    private _sku: ProductSku,
    private _price: Money,
    private _salePrice: Money | null,
    private _stockQuantity: number,
    private _manageStock: boolean,
    private _status: ProductStatus,
    private _weight: ProductWeight | null,
    private _dimensions: ProductDimensions | null,
    private _attributes: ProductAttributes,
    private _images: ProductImages,
    private _categoryIds: string[],
    private _averageRating: number,
    private _reviewCount: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null = null,
  ) {}

  static create(
    name: string,
    slug: string,
    description: string,
    shortDescription: string,
    sku: ProductSku,
    price: Money,
    stockQuantity: number = 0,
    manageStock: boolean = true,
  ): Product {
    const now = new Date();

    return new Product(
      uuidv4(),
      name,
      slug,
      description,
      shortDescription,
      sku,
      price,
      null, // salePrice
      stockQuantity,
      manageStock,
      ProductStatus.draft(),
      null, // weight
      null, // dimensions
      {}, // attributes
      { gallery: [] }, // images
      [], // categoryIds
      0, // averageRating
      0, // reviewCount
      now,
      now,
    );
  }

  static fromPersistence(
    id: string,
    name: string,
    slug: string,
    description: string,
    shortDescription: string,
    sku: ProductSku,
    price: Money,
    salePrice: Money | null,
    stockQuantity: number,
    manageStock: boolean,
    status: ProductStatus,
    weight: ProductWeight | null,
    dimensions: ProductDimensions | null,
    attributes: ProductAttributes,
    images: ProductImages,
    categoryIds: string[],
    averageRating: number,
    reviewCount: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null = null,
  ): Product {
    return new Product(
      id,
      name,
      slug,
      description,
      shortDescription,
      sku,
      price,
      salePrice,
      stockQuantity,
      manageStock,
      status,
      weight,
      dimensions,
      attributes,
      images,
      categoryIds,
      averageRating,
      reviewCount,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string {
    return this._description;
  }

  get shortDescription(): string {
    return this._shortDescription;
  }

  get sku(): ProductSku {
    return this._sku;
  }

  get price(): Money {
    return this._price;
  }

  get salePrice(): Money | null {
    return this._salePrice;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  get manageStock(): boolean {
    return this._manageStock;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get weight(): ProductWeight | null {
    return this._weight;
  }

  get dimensions(): ProductDimensions | null {
    return this._dimensions;
  }

  get attributes(): ProductAttributes {
    return { ...this._attributes };
  }

  get images(): ProductImages {
    return { ...this._images };
  }

  get categoryIds(): string[] {
    return [...this._categoryIds];
  }

  get averageRating(): number {
    return this._averageRating;
  }

  get reviewCount(): number {
    return this._reviewCount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  // Business methods
  updateBasicInfo(
    name: string,
    description: string,
    shortDescription: string,
  ): void {
    this.validateNotDeleted();

    if (!name || name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    this._name = name.trim();
    this._description = description;
    this._shortDescription = shortDescription;
    this._updatedAt = new Date();
  }

  updatePrice(price: Money, salePrice?: Money): void {
    this.validateNotDeleted();

    if (salePrice && salePrice.isGreaterThan(price)) {
      throw new Error('Sale price cannot be greater than regular price');
    }

    this._price = price;
    this._salePrice = salePrice || null;
    this._updatedAt = new Date();
  }

  updateStock(quantity: number): void {
    this.validateNotDeleted();

    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    this._stockQuantity = quantity;
    this._updatedAt = new Date();
  }

  reduceStock(quantity: number): void {
    this.validateNotDeleted();

    if (!this._manageStock) {
      return; // Don't manage stock for this product
    }

    if (quantity <= 0) {
      throw new Error('Quantity to reduce must be positive');
    }

    if (this._stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }

    this._stockQuantity -= quantity;
    this._updatedAt = new Date();
  }

  increaseStock(quantity: number): void {
    this.validateNotDeleted();

    if (quantity <= 0) {
      throw new Error('Quantity to increase must be positive');
    }

    this._stockQuantity += quantity;
    this._updatedAt = new Date();
  }

  setStatus(status: ProductStatus): void {
    this.validateNotDeleted();
    this._status = status;
    this._updatedAt = new Date();
  }

  activate(): void {
    this.setStatus(ProductStatus.active());
  }

  deactivate(): void {
    this.setStatus(ProductStatus.inactive());
  }

  archive(): void {
    this.setStatus(ProductStatus.archived());
  }

  updateWeight(weight: ProductWeight): void {
    this.validateNotDeleted();
    this._weight = weight;
    this._updatedAt = new Date();
  }

  updateDimensions(dimensions: ProductDimensions): void {
    this.validateNotDeleted();
    this._dimensions = dimensions;
    this._updatedAt = new Date();
  }

  updateAttributes(attributes: ProductAttributes): void {
    this.validateNotDeleted();
    this._attributes = { ...attributes };
    this._updatedAt = new Date();
  }

  addAttribute(key: string, value: string | string[]): void {
    this.validateNotDeleted();
    this._attributes[key] = value;
    this._updatedAt = new Date();
  }

  removeAttribute(key: string): void {
    this.validateNotDeleted();
    delete this._attributes[key];
    this._updatedAt = new Date();
  }

  updateImages(images: ProductImages): void {
    this.validateNotDeleted();
    this._images = { ...images };
    this._updatedAt = new Date();
  }

  setFeaturedImage(imageUrl: string): void {
    this.validateNotDeleted();
    this._images.featuredImage = imageUrl;
    this._updatedAt = new Date();
  }

  addImage(imageUrl: string): void {
    this.validateNotDeleted();
    if (!this._images.gallery.includes(imageUrl)) {
      this._images.gallery.push(imageUrl);
      this._updatedAt = new Date();
    }
  }

  removeImage(imageUrl: string): void {
    this.validateNotDeleted();
    this._images.gallery = this._images.gallery.filter(
      (img) => img !== imageUrl,
    );
    if (this._images.featuredImage === imageUrl) {
      this._images.featuredImage = this._images.gallery[0] || undefined;
    }
    this._updatedAt = new Date();
  }

  assignToCategories(categoryIds: string[]): void {
    this.validateNotDeleted();
    this._categoryIds = [...categoryIds];
    this._updatedAt = new Date();
  }

  addToCategory(categoryId: string): void {
    this.validateNotDeleted();
    if (!this._categoryIds.includes(categoryId)) {
      this._categoryIds.push(categoryId);
      this._updatedAt = new Date();
    }
  }

  removeFromCategory(categoryId: string): void {
    this.validateNotDeleted();
    this._categoryIds = this._categoryIds.filter((id) => id !== categoryId);
    this._updatedAt = new Date();
  }

  updateRating(averageRating: number, reviewCount: number): void {
    this.validateNotDeleted();

    if (averageRating < 0 || averageRating > 5) {
      throw new Error('Average rating must be between 0 and 5');
    }

    if (reviewCount < 0) {
      throw new Error('Review count cannot be negative');
    }

    this._averageRating = averageRating;
    this._reviewCount = reviewCount;
    this._updatedAt = new Date();
  }

  delete(): void {
    if (this.isDeleted()) {
      throw new Error('Product is already deleted');
    }

    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted()) {
      throw new Error('Product is not deleted');
    }

    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  // Query methods
  isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  isActive(): boolean {
    return !this.isDeleted() && this._status.isActive();
  }

  isInStock(): boolean {
    if (!this._manageStock) {
      return true; // Always in stock if not managing stock
    }
    return this._stockQuantity > 0;
  }

  isOnSale(): boolean {
    return this._salePrice !== null && this._salePrice.isLessThan(this._price);
  }

  getEffectivePrice(): Money {
    return this.isOnSale() ? this._salePrice! : this._price;
  }

  hasAttribute(key: string): boolean {
    return key in this._attributes;
  }

  getAttribute(key: string): string | string[] | undefined {
    return this._attributes[key];
  }

  hasImages(): boolean {
    return (
      this._images.featuredImage !== undefined ||
      this._images.gallery.length > 0
    );
  }

  getMainImage(): string | undefined {
    return this._images.featuredImage || this._images.gallery[0];
  }

  isInCategory(categoryId: string): boolean {
    return this._categoryIds.includes(categoryId);
  }

  hasReviews(): boolean {
    return this._reviewCount > 0;
  }

  // Validation methods
  private validateNotDeleted(): void {
    if (this.isDeleted()) {
      throw new Error('Cannot modify deleted product');
    }
  }

  // Business rule validation
  canBePurchased(): boolean {
    return this.isActive() && this.isInStock();
  }

  canBeDisplayed(): boolean {
    return this.isActive() && !this.isDeleted();
  }

  validateForPublication(): string[] {
    const errors: string[] = [];

    if (!this._name || this._name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!this._description || this._description.trim().length === 0) {
      errors.push('Product description is required');
    }

    if (!this._price || this._price.getAmount() <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (this._categoryIds.length === 0) {
      errors.push('Product must be assigned to at least one category');
    }

    if (!this.hasImages()) {
      errors.push('Product must have at least one image');
    }

    return errors;
  }
}
