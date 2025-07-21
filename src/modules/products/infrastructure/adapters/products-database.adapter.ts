import { Product } from '../../domain/entities/product.entity';
import { Category } from '../../domain/entities/category.entity';
import { ProductSku } from '../../domain/value-objects/product-sku.vo';
import {
  ProductFilters,
  ProductSortOptions,
  ProductPaginationOptions,
  ProductSearchResult,
} from '../../domain/repositories/product.repository';
import {
  CategoryFilters,
  CategorySortOptions,
  CategoryTreeNode,
} from '../../domain/repositories/category.repository';

export abstract class ProductsDatabaseAdapter {
  // Connection management
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract isConnected(): boolean;

  // Product operations
  abstract saveProduct(product: Product): Promise<Product>;
  abstract findProductById(id: string): Promise<Product | null>;
  abstract findProductBySku(sku: ProductSku): Promise<Product | null>;
  abstract findProductBySlug(slug: string): Promise<Product | null>;
  abstract findProducts(
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract findProductsByCategory(
    categoryId: string,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract searchProducts(
    query: string,
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract deleteProduct(id: string): Promise<void>;
  abstract permanentlyDeleteProduct(id: string): Promise<void>;
  abstract restoreProduct(id: string): Promise<void>;
  abstract productExists(id: string): Promise<boolean>;
  abstract productExistsBySku(sku: ProductSku): Promise<boolean>;
  abstract productExistsBySlug(slug: string): Promise<boolean>;
  abstract countProducts(filters?: ProductFilters): Promise<number>;
  abstract findRelatedProducts(
    productId: string,
    limit?: number,
  ): Promise<Product[]>;
  abstract findPopularProducts(limit?: number): Promise<Product[]>;
  abstract findRecentProducts(limit?: number): Promise<Product[]>;
  abstract findFeaturedProducts(limit?: number): Promise<Product[]>;
  abstract findProductsOnSale(
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract updateProductStock(
    productId: string,
    quantity: number,
  ): Promise<void>;
  abstract bulkUpdateProductStock(
    updates: Array<{ productId: string; quantity: number }>,
  ): Promise<void>;
  abstract findLowStockProducts(threshold?: number): Promise<Product[]>;
  abstract findOutOfStockProducts(): Promise<Product[]>;

  // Category operations
  abstract saveCategory(category: Category): Promise<Category>;
  abstract findCategoryById(id: string): Promise<Category | null>;
  abstract findCategoryBySlug(slug: string): Promise<Category | null>;
  abstract findCategories(
    filters?: CategoryFilters,
    sort?: CategorySortOptions,
  ): Promise<Category[]>;
  abstract findRootCategories(sort?: CategorySortOptions): Promise<Category[]>;
  abstract findCategoryChildren(
    parentId: string,
    sort?: CategorySortOptions,
  ): Promise<Category[]>;
  abstract findCategoryAncestors(categoryId: string): Promise<Category[]>;
  abstract findCategoryDescendants(categoryId: string): Promise<Category[]>;
  abstract findCategoryPath(categoryId: string): Promise<Category[]>;
  abstract buildCategoryTree(
    rootCategoryId?: string,
    includeProductCount?: boolean,
  ): Promise<CategoryTreeNode[]>;
  abstract deleteCategory(id: string): Promise<void>;
  abstract permanentlyDeleteCategory(id: string): Promise<void>;
  abstract restoreCategory(id: string): Promise<void>;
  abstract categoryExists(id: string): Promise<boolean>;
  abstract categoryExistsBySlug(slug: string): Promise<boolean>;
  abstract countCategories(filters?: CategoryFilters): Promise<number>;
  abstract moveCategory(
    categoryId: string,
    newParentId: string | null,
  ): Promise<void>;
  abstract reorderCategory(
    categoryId: string,
    newSortOrder: number,
  ): Promise<void>;
  abstract findCategoryBreadcrumb(
    categoryId: string,
  ): Promise<Array<{ id: string; name: string; slug: string }>>;
  abstract validateCategoryHierarchy(
    categoryId: string,
    newParentId: string | null,
  ): Promise<boolean>;
  abstract getCategoryProductCount(
    categoryId: string,
    includeDescendants?: boolean,
  ): Promise<number>;
  abstract findCategoriesWithProducts(): Promise<Category[]>;
  abstract findEmptyCategories(): Promise<Category[]>;

  // Product-Category relationships
  abstract assignProductToCategories(
    productId: string,
    categoryIds: string[],
  ): Promise<void>;
  abstract removeProductFromCategory(
    productId: string,
    categoryId: string,
  ): Promise<void>;
  abstract getProductCategories(productId: string): Promise<Category[]>;
  abstract getCategoryProducts(
    categoryId: string,
    includeDescendants?: boolean,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;

  // Batch operations
  abstract bulkSaveProducts(products: Product[]): Promise<Product[]>;
  abstract bulkSaveCategories(categories: Category[]): Promise<Category[]>;
  abstract bulkDeleteProducts(productIds: string[]): Promise<void>;
  abstract bulkDeleteCategories(categoryIds: string[]): Promise<void>;

  // Analytics and reporting
  abstract getProductAnalytics(productId: string): Promise<{
    viewCount: number;
    purchaseCount: number;
    averageRating: number;
    reviewCount: number;
    lastPurchased?: Date;
  }>;
  abstract getCategoryAnalytics(categoryId: string): Promise<{
    productCount: number;
    activeProductCount: number;
    totalViews: number;
    totalSales: number;
  }>;

  // Search optimization
  abstract rebuildSearchIndex(): Promise<void>;
  abstract updateSearchIndex(productId: string): Promise<void>;
  abstract removeFromSearchIndex(productId: string): Promise<void>;

  // Health check
  abstract healthCheck(): Promise<{
    isHealthy: boolean;
    details: {
      connection: boolean;
      productCount: number;
      categoryCount: number;
      lastUpdate: Date;
    };
  }>;
}
