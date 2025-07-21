import { Injectable, Inject } from '@nestjs/common';
import {
  ProductRepository,
  ProductFilters,
  ProductSortOptions,
  ProductPaginationOptions,
  ProductSearchResult,
} from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductSku } from '../../domain/value-objects/product-sku.vo';
import { ProductsDatabaseAdapter } from '../adapters/products-database.adapter';

@Injectable()
export class AdapterProductRepository extends ProductRepository {
  constructor(
    @Inject('ProductsDatabaseAdapter')
    private readonly databaseAdapter: ProductsDatabaseAdapter,
  ) {
    super();
  }

  async save(product: Product): Promise<Product> {
    return this.databaseAdapter.saveProduct(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.databaseAdapter.findProductById(id);
  }

  async findBySku(sku: ProductSku): Promise<Product | null> {
    return this.databaseAdapter.findProductBySku(sku);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.databaseAdapter.findProductBySlug(slug);
  }

  async findAll(
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    return this.databaseAdapter.findProducts(filters, sort, pagination);
  }

  async findByCategory(
    categoryId: string,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    return this.databaseAdapter.findProductsByCategory(
      categoryId,
      sort,
      pagination,
    );
  }

  async search(
    query: string,
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    return this.databaseAdapter.searchProducts(
      query,
      filters,
      sort,
      pagination,
    );
  }

  async delete(id: string): Promise<void> {
    return this.databaseAdapter.deleteProduct(id);
  }

  async permanentlyDelete(id: string): Promise<void> {
    return this.databaseAdapter.permanentlyDeleteProduct(id);
  }

  async restore(id: string): Promise<void> {
    return this.databaseAdapter.restoreProduct(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.databaseAdapter.productExists(id);
  }

  async existsBySku(sku: ProductSku): Promise<boolean> {
    return this.databaseAdapter.productExistsBySku(sku);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.databaseAdapter.productExistsBySlug(slug);
  }

  async count(filters?: ProductFilters): Promise<number> {
    return this.databaseAdapter.countProducts(filters);
  }

  async findRelated(productId: string, limit?: number): Promise<Product[]> {
    return this.databaseAdapter.findRelatedProducts(productId, limit);
  }

  async findPopular(limit?: number): Promise<Product[]> {
    return this.databaseAdapter.findPopularProducts(limit);
  }

  async findRecent(limit?: number): Promise<Product[]> {
    return this.databaseAdapter.findRecentProducts(limit);
  }

  async findFeatured(limit?: number): Promise<Product[]> {
    return this.databaseAdapter.findFeaturedProducts(limit);
  }

  async findOnSale(
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    return this.databaseAdapter.findProductsOnSale(sort, pagination);
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    return this.databaseAdapter.updateProductStock(productId, quantity);
  }

  async bulkUpdateStock(
    updates: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    return this.databaseAdapter.bulkUpdateProductStock(updates);
  }

  async findLowStock(threshold?: number): Promise<Product[]> {
    return this.databaseAdapter.findLowStockProducts(threshold);
  }

  async findOutOfStock(): Promise<Product[]> {
    return this.databaseAdapter.findOutOfStockProducts();
  }
}
