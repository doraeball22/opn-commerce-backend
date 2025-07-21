import { Product } from '../entities/product.entity';
import { ProductSku } from '../value-objects/product-sku.vo';

export interface ProductFilters {
  categoryIds?: string[];
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface ProductSortOptions {
  field:
    | 'name'
    | 'price'
    | 'createdAt'
    | 'updatedAt'
    | 'averageRating'
    | 'reviewCount';
  direction: 'ASC' | 'DESC';
}

export interface ProductPaginationOptions {
  offset: number;
  limit: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export abstract class ProductRepository {
  abstract save(product: Product): Promise<Product>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findBySku(sku: ProductSku): Promise<Product | null>;
  abstract findBySlug(slug: string): Promise<Product | null>;
  abstract findAll(
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract findByCategory(
    categoryId: string,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract search(
    query: string,
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract delete(id: string): Promise<void>;
  abstract permanentlyDelete(id: string): Promise<void>;
  abstract restore(id: string): Promise<void>;
  abstract exists(id: string): Promise<boolean>;
  abstract existsBySku(sku: ProductSku): Promise<boolean>;
  abstract existsBySlug(slug: string): Promise<boolean>;
  abstract count(filters?: ProductFilters): Promise<number>;
  abstract findRelated(productId: string, limit?: number): Promise<Product[]>;
  abstract findPopular(limit?: number): Promise<Product[]>;
  abstract findRecent(limit?: number): Promise<Product[]>;
  abstract findFeatured(limit?: number): Promise<Product[]>;
  abstract findOnSale(
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult>;
  abstract updateStock(productId: string, quantity: number): Promise<void>;
  abstract bulkUpdateStock(
    updates: Array<{ productId: string; quantity: number }>,
  ): Promise<void>;
  abstract findLowStock(threshold?: number): Promise<Product[]>;
  abstract findOutOfStock(): Promise<Product[]>;
}
