import { Injectable, Inject } from '@nestjs/common';
import {
  CategoryRepository,
  CategoryFilters,
  CategorySortOptions,
  CategoryTreeNode,
} from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';
import { ProductsDatabaseAdapter } from '../adapters/products-database.adapter';

@Injectable()
export class AdapterCategoryRepository extends CategoryRepository {
  constructor(
    @Inject('ProductsDatabaseAdapter')
    private readonly databaseAdapter: ProductsDatabaseAdapter,
  ) {
    super();
  }

  async save(category: Category): Promise<Category> {
    return this.databaseAdapter.saveCategory(category);
  }

  async findById(id: string): Promise<Category | null> {
    return this.databaseAdapter.findCategoryById(id);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.databaseAdapter.findCategoryBySlug(slug);
  }

  async findAll(
    filters?: CategoryFilters,
    sort?: CategorySortOptions,
  ): Promise<Category[]> {
    return this.databaseAdapter.findCategories(filters, sort);
  }

  async findRootCategories(sort?: CategorySortOptions): Promise<Category[]> {
    return this.databaseAdapter.findRootCategories(sort);
  }

  async findChildren(
    parentId: string,
    sort?: CategorySortOptions,
  ): Promise<Category[]> {
    return this.databaseAdapter.findCategoryChildren(parentId, sort);
  }

  async findAncestors(categoryId: string): Promise<Category[]> {
    return this.databaseAdapter.findCategoryAncestors(categoryId);
  }

  async findDescendants(categoryId: string): Promise<Category[]> {
    return this.databaseAdapter.findCategoryDescendants(categoryId);
  }

  async findPath(categoryId: string): Promise<Category[]> {
    return this.databaseAdapter.findCategoryPath(categoryId);
  }

  async buildTree(
    rootCategoryId?: string,
    includeProductCount?: boolean,
  ): Promise<CategoryTreeNode[]> {
    return this.databaseAdapter.buildCategoryTree(
      rootCategoryId,
      includeProductCount,
    );
  }

  async delete(id: string): Promise<void> {
    return this.databaseAdapter.deleteCategory(id);
  }

  async permanentlyDelete(id: string): Promise<void> {
    return this.databaseAdapter.permanentlyDeleteCategory(id);
  }

  async restore(id: string): Promise<void> {
    return this.databaseAdapter.restoreCategory(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.databaseAdapter.categoryExists(id);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.databaseAdapter.categoryExistsBySlug(slug);
  }

  async count(filters?: CategoryFilters): Promise<number> {
    return this.databaseAdapter.countCategories(filters);
  }

  async move(categoryId: string, newParentId: string | null): Promise<void> {
    return this.databaseAdapter.moveCategory(categoryId, newParentId);
  }

  async reorder(categoryId: string, newSortOrder: number): Promise<void> {
    return this.databaseAdapter.reorderCategory(categoryId, newSortOrder);
  }

  async findBreadcrumb(
    categoryId: string,
  ): Promise<Array<{ id: string; name: string; slug: string }>> {
    return this.databaseAdapter.findCategoryBreadcrumb(categoryId);
  }

  async validateHierarchy(
    categoryId: string,
    newParentId: string | null,
  ): Promise<boolean> {
    return this.databaseAdapter.validateCategoryHierarchy(
      categoryId,
      newParentId,
    );
  }

  async getProductCount(
    categoryId: string,
    includeDescendants?: boolean,
  ): Promise<number> {
    return this.databaseAdapter.getCategoryProductCount(
      categoryId,
      includeDescendants,
    );
  }

  async findCategoriesWithProducts(): Promise<Category[]> {
    return this.databaseAdapter.findCategoriesWithProducts();
  }

  async findEmptyCategories(): Promise<Category[]> {
    return this.databaseAdapter.findEmptyCategories();
  }
}
