import { Category } from '../entities/category.entity';

export interface CategoryFilters {
  parentId?: string | null;
  isActive?: boolean;
  search?: string;
}

export interface CategorySortOptions {
  field: 'name' | 'sortOrder' | 'createdAt' | 'updatedAt';
  direction: 'ASC' | 'DESC';
}

export interface CategoryTreeNode {
  category: Category;
  children: CategoryTreeNode[];
  level: number;
  hasChildren: boolean;
  productCount?: number;
}

export abstract class CategoryRepository {
  abstract save(category: Category): Promise<Category>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findBySlug(slug: string): Promise<Category | null>;
  abstract findAll(
    filters?: CategoryFilters,
    sort?: CategorySortOptions,
  ): Promise<Category[]>;
  abstract findRootCategories(sort?: CategorySortOptions): Promise<Category[]>;
  abstract findChildren(
    parentId: string,
    sort?: CategorySortOptions,
  ): Promise<Category[]>;
  abstract findAncestors(categoryId: string): Promise<Category[]>;
  abstract findDescendants(categoryId: string): Promise<Category[]>;
  abstract findPath(categoryId: string): Promise<Category[]>;
  abstract buildTree(
    rootCategoryId?: string,
    includeProductCount?: boolean,
  ): Promise<CategoryTreeNode[]>;
  abstract delete(id: string): Promise<void>;
  abstract permanentlyDelete(id: string): Promise<void>;
  abstract restore(id: string): Promise<void>;
  abstract exists(id: string): Promise<boolean>;
  abstract existsBySlug(slug: string): Promise<boolean>;
  abstract count(filters?: CategoryFilters): Promise<number>;
  abstract move(categoryId: string, newParentId: string | null): Promise<void>;
  abstract reorder(categoryId: string, newSortOrder: number): Promise<void>;
  abstract findBreadcrumb(
    categoryId: string,
  ): Promise<Array<{ id: string; name: string; slug: string }>>;
  abstract validateHierarchy(
    categoryId: string,
    newParentId: string | null,
  ): Promise<boolean>;
  abstract getProductCount(
    categoryId: string,
    includeDescendants?: boolean,
  ): Promise<number>;
  abstract findCategoriesWithProducts(): Promise<Category[]>;
  abstract findEmptyCategories(): Promise<Category[]>;
}
