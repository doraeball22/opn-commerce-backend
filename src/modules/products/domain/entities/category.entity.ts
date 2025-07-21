import { v4 as uuidv4 } from 'uuid';

export class Category {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _slug: string,
    private _description: string | null,
    private _parentId: string | null,
    private _imageUrl: string | null,
    private _isActive: boolean,
    private _sortOrder: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null = null,
  ) {}

  static create(
    name: string,
    slug: string,
    description?: string,
    parentId?: string,
  ): Category {
    const now = new Date();

    return new Category(
      uuidv4(),
      name,
      slug,
      description || null,
      parentId || null,
      null, // imageUrl
      true, // isActive
      0, // sortOrder
      now,
      now,
    );
  }

  static fromPersistence(
    id: string,
    name: string,
    slug: string,
    description: string | null,
    parentId: string | null,
    imageUrl: string | null,
    isActive: boolean,
    sortOrder: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null = null,
  ): Category {
    return new Category(
      id,
      name,
      slug,
      description,
      parentId,
      imageUrl,
      isActive,
      sortOrder,
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

  get description(): string | null {
    return this._description;
  }

  get parentId(): string | null {
    return this._parentId;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get sortOrder(): number {
    return this._sortOrder;
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
  updateBasicInfo(name: string, description?: string): void {
    this.validateNotDeleted();

    if (!name || name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }

    this._name = name.trim();
    this._description = description || null;
    this._updatedAt = new Date();
  }

  updateSlug(slug: string): void {
    this.validateNotDeleted();

    if (!slug || slug.trim().length === 0) {
      throw new Error('Category slug cannot be empty');
    }

    // Basic slug validation
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(
        'Category slug can only contain lowercase letters, numbers, and hyphens',
      );
    }

    this._slug = slug.trim();
    this._updatedAt = new Date();
  }

  setParent(parentId: string | null): void {
    this.validateNotDeleted();

    if (parentId === this._id) {
      throw new Error('Category cannot be its own parent');
    }

    this._parentId = parentId;
    this._updatedAt = new Date();
  }

  setImage(imageUrl: string | null): void {
    this.validateNotDeleted();
    this._imageUrl = imageUrl;
    this._updatedAt = new Date();
  }

  activate(): void {
    this.validateNotDeleted();
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this.validateNotDeleted();
    this._isActive = false;
    this._updatedAt = new Date();
  }

  setSortOrder(sortOrder: number): void {
    this.validateNotDeleted();

    if (sortOrder < 0) {
      throw new Error('Sort order cannot be negative');
    }

    this._sortOrder = sortOrder;
    this._updatedAt = new Date();
  }

  delete(): void {
    if (this.isDeleted()) {
      throw new Error('Category is already deleted');
    }

    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted()) {
      throw new Error('Category is not deleted');
    }

    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  // Query methods
  isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  isRootCategory(): boolean {
    return this._parentId === null;
  }

  hasParent(): boolean {
    return this._parentId !== null;
  }

  hasImage(): boolean {
    return this._imageUrl !== null && this._imageUrl.trim().length > 0;
  }

  canBeDisplayed(): boolean {
    return this._isActive && !this.isDeleted();
  }

  // Validation methods
  private validateNotDeleted(): void {
    if (this.isDeleted()) {
      throw new Error('Cannot modify deleted category');
    }
  }

  validateForPublication(): string[] {
    const errors: string[] = [];

    if (!this._name || this._name.trim().length === 0) {
      errors.push('Category name is required');
    }

    if (!this._slug || this._slug.trim().length === 0) {
      errors.push('Category slug is required');
    }

    if (this._slug && !/^[a-z0-9-]+$/.test(this._slug)) {
      errors.push(
        'Category slug can only contain lowercase letters, numbers, and hyphens',
      );
    }

    return errors;
  }

  // Helper methods for hierarchy management
  getPath(categories: Category[]): Category[] {
    const path: Category[] = [this];
    let current = this;

    while (current.hasParent()) {
      const parent = categories.find((cat) => cat.id === current.parentId);
      if (!parent) break;

      path.unshift(parent);
      current = parent as this;
    }

    return path;
  }

  getChildren(categories: Category[]): Category[] {
    return categories.filter(
      (cat) => cat.parentId === this._id && !cat.isDeleted(),
    );
  }

  getDescendants(categories: Category[]): Category[] {
    const descendants: Category[] = [];
    const children = this.getChildren(categories);

    for (const child of children) {
      descendants.push(child);
      descendants.push(...child.getDescendants(categories));
    }

    return descendants;
  }

  isAncestorOf(category: Category, categories: Category[]): boolean {
    const descendants = this.getDescendants(categories);
    return descendants.some((desc) => desc.id === category.id);
  }

  isDescendantOf(category: Category, categories: Category[]): boolean {
    return category.isAncestorOf(this, categories);
  }

  getLevel(categories: Category[]): number {
    let level = 0;
    let current = this;

    while (current.hasParent()) {
      const parent = categories.find((cat) => cat.id === current.parentId);
      if (!parent) break;

      level++;
      current = parent as this;
    }

    return level;
  }
}
