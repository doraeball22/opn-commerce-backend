import { Injectable } from '@nestjs/common';
import { ProductsDatabaseAdapter } from './products-database.adapter';
import { Product } from '../../domain/entities/product.entity';
import { Category } from '../../domain/entities/category.entity';
import { ProductSku } from '../../domain/value-objects/product-sku.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { ProductStatus } from '../../domain/value-objects/product-status.vo';
import {
  ProductWeight,
  WeightUnit,
} from '../../domain/value-objects/product-weight.vo';
import {
  ProductDimensions,
  DimensionUnit,
} from '../../domain/value-objects/product-dimensions.vo';
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

@Injectable()
export class MockProductsDatabaseAdapter extends ProductsDatabaseAdapter {
  private products = new Map<string, Product>();
  private categories = new Map<string, Category>();
  private isConnectedFlag = false;

  async connect(): Promise<void> {
    console.log('🔧 Using Mock Products Database Adapter');
    await this.seedTestData();
    this.isConnectedFlag = true;
    console.log('🔗 Mock Products Database: Connected with test data seeded');
  }

  async disconnect(): Promise<void> {
    this.isConnectedFlag = false;
    console.log('🔗 Mock Products Database: Disconnected');
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  // Product operations
  async saveProduct(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async findProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findProductBySku(sku: ProductSku): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.sku.equals(sku) && !product.isDeleted()) {
        return product;
      }
    }
    return null;
  }

  async findProductBySlug(slug: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.slug === slug && !product.isDeleted()) {
        return product;
      }
    }
    return null;
  }

  async findProducts(
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    let products = Array.from(this.products.values());

    // Apply filters
    if (filters) {
      products = this.applyProductFilters(products, filters);
    }

    // Apply sorting
    if (sort) {
      products = this.applyProductSort(products, sort);
    }

    const total = products.length;

    // Apply pagination
    if (pagination) {
      const start = pagination.offset;
      const end = start + pagination.limit;
      products = products.slice(start, end);
    }

    return {
      products,
      total,
      hasMore: pagination
        ? pagination.offset + pagination.limit < total
        : false,
    };
  }

  async findProductsByCategory(
    categoryId: string,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    const filters: ProductFilters = { categoryIds: [categoryId] };
    return this.findProducts(filters, sort, pagination);
  }

  async searchProducts(
    query: string,
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    const searchFilters: ProductFilters = { ...filters, search: query };
    return this.findProducts(searchFilters, sort, pagination);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.delete();
      this.products.set(id, product);
    }
  }

  async permanentlyDeleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async restoreProduct(id: string): Promise<void> {
    const product = this.products.get(id);
    if (product && product.isDeleted()) {
      product.restore();
      this.products.set(id, product);
    }
  }

  async productExists(id: string): Promise<boolean> {
    return this.products.has(id);
  }

  async productExistsBySku(sku: ProductSku): Promise<boolean> {
    return (await this.findProductBySku(sku)) !== null;
  }

  async productExistsBySlug(slug: string): Promise<boolean> {
    return (await this.findProductBySlug(slug)) !== null;
  }

  async countProducts(filters?: ProductFilters): Promise<number> {
    let products = Array.from(this.products.values());
    if (filters) {
      products = this.applyProductFilters(products, filters);
    }
    return products.length;
  }

  async findRelatedProducts(
    productId: string,
    limit: number = 5,
  ): Promise<Product[]> {
    const product = await this.findProductById(productId);
    if (!product) return [];

    // Simple related products logic - same categories
    const relatedProducts = Array.from(this.products.values())
      .filter(
        (p) =>
          p.id !== productId &&
          !p.isDeleted() &&
          p.isActive() &&
          p.categoryIds.some((catId) => product.categoryIds.includes(catId)),
      )
      .slice(0, limit);

    return relatedProducts;
  }

  async findPopularProducts(limit: number = 10): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter((p) => !p.isDeleted() && p.isActive())
      .sort(
        (a, b) =>
          b.reviewCount - a.reviewCount || b.averageRating - a.averageRating,
      )
      .slice(0, limit);
  }

  async findRecentProducts(limit: number = 10): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter((p) => !p.isDeleted() && p.isActive())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findFeaturedProducts(limit: number = 10): Promise<Product[]> {
    // For mock, consider products with high ratings as featured
    return Array.from(this.products.values())
      .filter((p) => !p.isDeleted() && p.isActive() && p.averageRating >= 4.0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  }

  async findProductsOnSale(
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    let products = Array.from(this.products.values()).filter(
      (p) => !p.isDeleted() && p.isActive() && p.isOnSale(),
    );

    if (sort) {
      products = this.applyProductSort(products, sort);
    }

    const total = products.length;

    if (pagination) {
      const start = pagination.offset;
      const end = start + pagination.limit;
      products = products.slice(start, end);
    }

    return {
      products,
      total,
      hasMore: pagination
        ? pagination.offset + pagination.limit < total
        : false,
    };
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    const product = this.products.get(productId);
    if (product) {
      product.updateStock(quantity);
      this.products.set(productId, product);
    }
  }

  async bulkUpdateProductStock(
    updates: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    for (const update of updates) {
      await this.updateProductStock(update.productId, update.quantity);
    }
  }

  async findLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (p) =>
        !p.isDeleted() &&
        p.manageStock &&
        p.stockQuantity <= threshold &&
        p.stockQuantity > 0,
    );
  }

  async findOutOfStockProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (p) => !p.isDeleted() && p.manageStock && p.stockQuantity === 0,
    );
  }

  // Category operations
  async saveCategory(category: Category): Promise<Category> {
    this.categories.set(category.id, category);
    return category;
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return this.categories.get(id) || null;
  }

  async findCategoryBySlug(slug: string): Promise<Category | null> {
    for (const category of this.categories.values()) {
      if (category.slug === slug && !category.isDeleted()) {
        return category;
      }
    }
    return null;
  }

  async findCategories(
    filters?: CategoryFilters,
    sort?: CategorySortOptions,
  ): Promise<Category[]> {
    let categories = Array.from(this.categories.values());

    if (filters) {
      categories = this.applyCategoryFilters(categories, filters);
    }

    if (sort) {
      categories = this.applyCategorySort(categories, sort);
    }

    return categories;
  }

  async findRootCategories(sort?: CategorySortOptions): Promise<Category[]> {
    const filters: CategoryFilters = { parentId: null };
    return this.findCategories(filters, sort);
  }

  async findCategoryChildren(
    parentId: string,
    sort?: CategorySortOptions,
  ): Promise<Category[]> {
    const filters: CategoryFilters = { parentId };
    return this.findCategories(filters, sort);
  }

  async findCategoryAncestors(categoryId: string): Promise<Category[]> {
    const ancestors: Category[] = [];
    let current = await this.findCategoryById(categoryId);

    while (current && current.parentId) {
      const parent = await this.findCategoryById(current.parentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return ancestors;
  }

  async findCategoryDescendants(categoryId: string): Promise<Category[]> {
    const descendants: Category[] = [];
    const children = await this.findCategoryChildren(categoryId);

    for (const child of children) {
      descendants.push(child);
      const childDescendants = await this.findCategoryDescendants(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  async findCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = [];
    const category = await this.findCategoryById(categoryId);

    if (category) {
      const ancestors = await this.findCategoryAncestors(categoryId);
      path.push(...ancestors, category);
    }

    return path;
  }

  async buildCategoryTree(
    rootCategoryId?: string,
    includeProductCount?: boolean,
  ): Promise<CategoryTreeNode[]> {
    const rootCategories = rootCategoryId
      ? ([await this.findCategoryById(rootCategoryId)].filter(
          Boolean,
        ) as Category[])
      : await this.findRootCategories({ field: 'sortOrder', direction: 'ASC' });

    const buildNode = async (
      category: Category,
      level: number = 0,
    ): Promise<CategoryTreeNode> => {
      const children = await this.findCategoryChildren(category.id, {
        field: 'sortOrder',
        direction: 'ASC',
      });
      const childNodes = await Promise.all(
        children.map((child) => buildNode(child, level + 1)),
      );

      const productCount = includeProductCount
        ? await this.getCategoryProductCount(category.id, true)
        : undefined;

      return {
        category,
        children: childNodes,
        level,
        hasChildren: children.length > 0,
        productCount,
      };
    };

    return Promise.all(rootCategories.map((category) => buildNode(category)));
  }

  async deleteCategory(id: string): Promise<void> {
    const category = this.categories.get(id);
    if (category) {
      category.delete();
      this.categories.set(id, category);
    }
  }

  async permanentlyDeleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  async restoreCategory(id: string): Promise<void> {
    const category = this.categories.get(id);
    if (category && category.isDeleted()) {
      category.restore();
      this.categories.set(id, category);
    }
  }

  async categoryExists(id: string): Promise<boolean> {
    return this.categories.has(id);
  }

  async categoryExistsBySlug(slug: string): Promise<boolean> {
    return (await this.findCategoryBySlug(slug)) !== null;
  }

  async countCategories(filters?: CategoryFilters): Promise<number> {
    let categories = Array.from(this.categories.values());
    if (filters) {
      categories = this.applyCategoryFilters(categories, filters);
    }
    return categories.length;
  }

  async moveCategory(
    categoryId: string,
    newParentId: string | null,
  ): Promise<void> {
    const category = this.categories.get(categoryId);
    if (category) {
      category.setParent(newParentId);
      this.categories.set(categoryId, category);
    }
  }

  async reorderCategory(
    categoryId: string,
    newSortOrder: number,
  ): Promise<void> {
    const category = this.categories.get(categoryId);
    if (category) {
      category.setSortOrder(newSortOrder);
      this.categories.set(categoryId, category);
    }
  }

  async findCategoryBreadcrumb(
    categoryId: string,
  ): Promise<Array<{ id: string; name: string; slug: string }>> {
    const path = await this.findCategoryPath(categoryId);
    return path.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
  }

  async validateCategoryHierarchy(
    categoryId: string,
    newParentId: string | null,
  ): Promise<boolean> {
    if (!newParentId) return true;

    // Check if newParentId is a descendant of categoryId
    const descendants = await this.findCategoryDescendants(categoryId);
    return !descendants.some((desc) => desc.id === newParentId);
  }

  async getCategoryProductCount(
    categoryId: string,
    includeDescendants: boolean = false,
  ): Promise<number> {
    let productCount = 0;

    for (const product of this.products.values()) {
      if (!product.isDeleted() && product.categoryIds.includes(categoryId)) {
        productCount++;
      }
    }

    if (includeDescendants) {
      const descendants = await this.findCategoryDescendants(categoryId);
      for (const descendant of descendants) {
        for (const product of this.products.values()) {
          if (
            !product.isDeleted() &&
            product.categoryIds.includes(descendant.id)
          ) {
            productCount++;
          }
        }
      }
    }

    return productCount;
  }

  async findCategoriesWithProducts(): Promise<Category[]> {
    const categoriesWithProducts = new Set<string>();

    for (const product of this.products.values()) {
      if (!product.isDeleted()) {
        product.categoryIds.forEach((catId) =>
          categoriesWithProducts.add(catId),
        );
      }
    }

    return Array.from(this.categories.values()).filter(
      (cat) => categoriesWithProducts.has(cat.id) && !cat.isDeleted(),
    );
  }

  async findEmptyCategories(): Promise<Category[]> {
    const categoriesWithProducts = await this.findCategoriesWithProducts();
    const categoriesWithProductIds = new Set(
      categoriesWithProducts.map((cat) => cat.id),
    );

    return Array.from(this.categories.values()).filter(
      (cat) => !categoriesWithProductIds.has(cat.id) && !cat.isDeleted(),
    );
  }

  // Product-Category relationships
  async assignProductToCategories(
    productId: string,
    categoryIds: string[],
  ): Promise<void> {
    const product = this.products.get(productId);
    if (product) {
      product.assignToCategories(categoryIds);
      this.products.set(productId, product);
    }
  }

  async removeProductFromCategory(
    productId: string,
    categoryId: string,
  ): Promise<void> {
    const product = this.products.get(productId);
    if (product) {
      product.removeFromCategory(categoryId);
      this.products.set(productId, product);
    }
  }

  async getProductCategories(productId: string): Promise<Category[]> {
    const product = await this.findProductById(productId);
    if (!product) return [];

    const categories: Category[] = [];
    for (const categoryId of product.categoryIds) {
      const category = await this.findCategoryById(categoryId);
      if (category) {
        categories.push(category);
      }
    }

    return categories;
  }

  async getCategoryProducts(
    categoryId: string,
    includeDescendants: boolean = false,
    sort?: ProductSortOptions,
    pagination?: ProductPaginationOptions,
  ): Promise<ProductSearchResult> {
    let categoryIds = [categoryId];

    if (includeDescendants) {
      const descendants = await this.findCategoryDescendants(categoryId);
      categoryIds.push(...descendants.map((desc) => desc.id));
    }

    const filters: ProductFilters = { categoryIds };
    return this.findProducts(filters, sort, pagination);
  }

  // Batch operations
  async bulkSaveProducts(products: Product[]): Promise<Product[]> {
    const savedProducts: Product[] = [];
    for (const product of products) {
      const saved = await this.saveProduct(product);
      savedProducts.push(saved);
    }
    return savedProducts;
  }

  async bulkSaveCategories(categories: Category[]): Promise<Category[]> {
    const savedCategories: Category[] = [];
    for (const category of categories) {
      const saved = await this.saveCategory(category);
      savedCategories.push(saved);
    }
    return savedCategories;
  }

  async bulkDeleteProducts(productIds: string[]): Promise<void> {
    for (const productId of productIds) {
      await this.deleteProduct(productId);
    }
  }

  async bulkDeleteCategories(categoryIds: string[]): Promise<void> {
    for (const categoryId of categoryIds) {
      await this.deleteCategory(categoryId);
    }
  }

  // Analytics and reporting
  async getProductAnalytics(productId: string): Promise<{
    viewCount: number;
    purchaseCount: number;
    averageRating: number;
    reviewCount: number;
    lastPurchased?: Date;
  }> {
    const product = await this.findProductById(productId);
    if (!product) {
      return {
        viewCount: 0,
        purchaseCount: 0,
        averageRating: 0,
        reviewCount: 0,
      };
    }

    // Mock analytics data
    return {
      viewCount: Math.floor(Math.random() * 1000),
      purchaseCount: Math.floor(Math.random() * 100),
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      lastPurchased: new Date(
        Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      ),
    };
  }

  async getCategoryAnalytics(categoryId: string): Promise<{
    productCount: number;
    activeProductCount: number;
    totalViews: number;
    totalSales: number;
  }> {
    const productCount = await this.getCategoryProductCount(categoryId, true);
    const products = await this.getCategoryProducts(categoryId, true);
    const activeProductCount = products.products.filter((p) =>
      p.isActive(),
    ).length;

    return {
      productCount,
      activeProductCount,
      totalViews: Math.floor(Math.random() * 10000),
      totalSales: Math.floor(Math.random() * 1000),
    };
  }

  // Search optimization
  async rebuildSearchIndex(): Promise<void> {
    // Mock implementation - in real implementation would rebuild search index
    console.log('🔍 Mock: Search index rebuilt');
  }

  async updateSearchIndex(productId: string): Promise<void> {
    // Mock implementation
    console.log(`🔍 Mock: Updated search index for product ${productId}`);
  }

  async removeFromSearchIndex(productId: string): Promise<void> {
    // Mock implementation
    console.log(`🔍 Mock: Removed product ${productId} from search index`);
  }

  // Health check
  async healthCheck(): Promise<{
    isHealthy: boolean;
    details: {
      connection: boolean;
      productCount: number;
      categoryCount: number;
      lastUpdate: Date;
    };
  }> {
    return {
      isHealthy: this.isConnected(),
      details: {
        connection: this.isConnected(),
        productCount: this.products.size,
        categoryCount: this.categories.size,
        lastUpdate: new Date(),
      },
    };
  }

  // Helper methods
  private applyProductFilters(
    products: Product[],
    filters: ProductFilters,
  ): Product[] {
    return products.filter((product) => {
      if (
        filters.isActive !== undefined &&
        product.isActive() !== filters.isActive
      ) {
        return false;
      }

      if (
        filters.inStock !== undefined &&
        product.isInStock() !== filters.inStock
      ) {
        return false;
      }

      if (filters.status && product.status.toString() !== filters.status) {
        return false;
      }

      if (filters.categoryIds && filters.categoryIds.length > 0) {
        const hasCategory = product.categoryIds.some((catId) =>
          filters.categoryIds!.includes(catId),
        );
        if (!hasCategory) return false;
      }

      if (
        filters.minPrice !== undefined &&
        product.getEffectivePrice().getAmount() < filters.minPrice
      ) {
        return false;
      }

      if (
        filters.maxPrice !== undefined &&
        product.getEffectivePrice().getAmount() > filters.maxPrice
      ) {
        return false;
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText =
          `${product.name} ${product.description} ${product.shortDescription}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return !product.isDeleted();
    });
  }

  private applyProductSort(
    products: Product[],
    sort: ProductSortOptions,
  ): Product[] {
    return products.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison =
            a.getEffectivePrice().getAmount() -
            b.getEffectivePrice().getAmount();
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'averageRating':
          comparison = a.averageRating - b.averageRating;
          break;
        case 'reviewCount':
          comparison = a.reviewCount - b.reviewCount;
          break;
      }

      return sort.direction === 'DESC' ? -comparison : comparison;
    });
  }

  private applyCategoryFilters(
    categories: Category[],
    filters: CategoryFilters,
  ): Category[] {
    return categories.filter((category) => {
      if (
        filters.isActive !== undefined &&
        category.isActive !== filters.isActive
      ) {
        return false;
      }

      if (filters.parentId !== undefined) {
        if (filters.parentId === null && category.parentId !== null) {
          return false;
        }
        if (
          filters.parentId !== null &&
          category.parentId !== filters.parentId
        ) {
          return false;
        }
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText =
          `${category.name} ${category.description || ''}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return !category.isDeleted();
    });
  }

  private applyCategorySort(
    categories: Category[],
    sort: CategorySortOptions,
  ): Category[] {
    return categories.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sortOrder':
          comparison = a.sortOrder - b.sortOrder;
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }

      return sort.direction === 'DESC' ? -comparison : comparison;
    });
  }

  private async seedTestData(): Promise<void> {
    console.log('🌱 Seeding test products and categories...');

    // Create categories
    const electronicsCategory = Category.create(
      'Electronics',
      'electronics',
      'Electronic devices and gadgets',
    );
    await this.saveCategory(electronicsCategory);

    const computersCategory = Category.create(
      'Computers',
      'computers',
      'Desktop and laptop computers',
      electronicsCategory.id,
    );
    await this.saveCategory(computersCategory);

    const phonesCategory = Category.create(
      'Smartphones',
      'smartphones',
      'Mobile phones and accessories',
      electronicsCategory.id,
    );
    await this.saveCategory(phonesCategory);

    const clothingCategory = Category.create(
      'Clothing',
      'clothing',
      'Fashion and apparel',
    );
    await this.saveCategory(clothingCategory);

    const mensCategory = Category.create(
      "Men's Clothing",
      'mens-clothing',
      "Men's fashion and apparel",
      clothingCategory.id,
    );
    await this.saveCategory(mensCategory);

    const womensCategory = Category.create(
      "Women's Clothing",
      'womens-clothing',
      "Women's fashion and apparel",
      clothingCategory.id,
    );
    await this.saveCategory(womensCategory);

    // Create products
    const laptop = Product.create(
      'MacBook Pro 16"',
      'macbook-pro-16',
      'Powerful laptop for professionals with M2 Pro chip, 16GB RAM, and 512GB SSD. Perfect for development, design, and creative work.',
      'Professional laptop with M2 Pro chip',
      ProductSku.create('MBP-16-M2-512'),
      Money.create(89900, 'THB'),
      5,
      true,
    );
    laptop.updateWeight(ProductWeight.create(2.15, WeightUnit.KILOGRAMS));
    laptop.updateDimensions(
      ProductDimensions.create(35.57, 24.81, 1.68, DimensionUnit.CENTIMETERS),
    );
    laptop.setStatus(ProductStatus.active());
    laptop.assignToCategories([electronicsCategory.id, computersCategory.id]);
    laptop.updateRating(4.8, 24);
    laptop.setFeaturedImage('https://example.com/images/macbook-pro-16.jpg');
    await this.saveProduct(laptop);

    const iphone = Product.create(
      'iPhone 15 Pro',
      'iphone-15-pro',
      'Latest iPhone with A17 Pro chip, Pro camera system, and titanium design. Available in Natural Titanium, Blue Titanium, White Titanium, and Black Titanium.',
      'Latest iPhone with titanium design',
      ProductSku.create('IPH-15-PRO-128'),
      Money.create(39900, 'THB'),
      12,
      true,
    );
    iphone.updatePrice(Money.create(39900, 'THB'), Money.create(35900, 'THB')); // On sale
    iphone.updateWeight(ProductWeight.create(187, WeightUnit.GRAMS));
    iphone.updateDimensions(
      ProductDimensions.create(146.6, 70.6, 8.25, DimensionUnit.MILLIMETERS),
    );
    iphone.setStatus(ProductStatus.active());
    iphone.assignToCategories([electronicsCategory.id, phonesCategory.id]);
    iphone.updateRating(4.6, 156);
    iphone.setFeaturedImage('https://example.com/images/iphone-15-pro.jpg');
    await this.saveProduct(iphone);

    const tshirt = Product.create(
      'Cotton T-Shirt',
      'cotton-t-shirt',
      'Premium 100% cotton t-shirt with comfortable fit. Available in multiple colors and sizes. Perfect for casual wear.',
      'Premium cotton t-shirt',
      ProductSku.create('TSH-COT-001'),
      Money.create(590, 'THB'),
      50,
      true,
    );
    tshirt.updateWeight(ProductWeight.create(200, WeightUnit.GRAMS));
    tshirt.setStatus(ProductStatus.active());
    tshirt.assignToCategories([clothingCategory.id, mensCategory.id]);
    tshirt.updateRating(4.2, 89);
    tshirt.addAttribute('color', ['Black', 'White', 'Navy', 'Gray']);
    tshirt.addAttribute('size', ['S', 'M', 'L', 'XL', 'XXL']);
    tshirt.addAttribute('material', '100% Cotton');
    tshirt.setFeaturedImage('https://example.com/images/cotton-t-shirt.jpg');
    await this.saveProduct(tshirt);

    const dress = Product.create(
      'Summer Dress',
      'summer-dress',
      'Elegant summer dress made from lightweight fabric. Perfect for warm weather and special occasions.',
      'Elegant lightweight summer dress',
      ProductSku.create('DRS-SUM-001'),
      Money.create(1290, 'THB'),
      25,
      true,
    );
    dress.updateWeight(ProductWeight.create(300, WeightUnit.GRAMS));
    dress.setStatus(ProductStatus.active());
    dress.assignToCategories([clothingCategory.id, womensCategory.id]);
    dress.updateRating(4.5, 42);
    dress.addAttribute('color', ['Blue', 'Pink', 'Yellow', 'White']);
    dress.addAttribute('size', ['XS', 'S', 'M', 'L', 'XL']);
    dress.addAttribute('material', 'Polyester blend');
    dress.setFeaturedImage('https://example.com/images/summer-dress.jpg');
    await this.saveProduct(dress);

    const gaming_mouse = Product.create(
      'Gaming Mouse Pro',
      'gaming-mouse-pro',
      'High-precision gaming mouse with RGB lighting, programmable buttons, and ergonomic design for competitive gaming.',
      'Professional gaming mouse with RGB',
      ProductSku.create('MSE-GAM-PRO'),
      Money.create(2490, 'THB'),
      30,
      true,
    );
    gaming_mouse.updateWeight(ProductWeight.create(95, WeightUnit.GRAMS));
    gaming_mouse.updateDimensions(
      ProductDimensions.create(128, 68, 42, DimensionUnit.MILLIMETERS),
    );
    gaming_mouse.setStatus(ProductStatus.active());
    gaming_mouse.assignToCategories([
      electronicsCategory.id,
      computersCategory.id,
    ]);
    gaming_mouse.updateRating(4.7, 78);
    gaming_mouse.addAttribute('dpi', '16000');
    gaming_mouse.addAttribute('buttons', '8');
    gaming_mouse.addAttribute('connectivity', 'USB-C');
    gaming_mouse.setFeaturedImage(
      'https://example.com/images/gaming-mouse-pro.jpg',
    );
    await this.saveProduct(gaming_mouse);

    console.log('✅ Test products and categories seeded successfully:');
    console.log(`  📱 ${this.products.size} products created`);
    console.log(`  📂 ${this.categories.size} categories created`);
  }
}
