import { Injectable } from '@nestjs/common';
import {
  IProductService,
  ProductInfo,
} from '../../application/interfaces/product.service.interface';
import { Money } from '../../domain/value-objects/money.vo';

@Injectable()
export class MockProductService implements IProductService {
  private readonly products = new Map<string, ProductInfo>();

  constructor() {
    this.seedTestData();
  }

  private seedTestData(): void {
    // Sample products for cart testing
    const testProducts: ProductInfo[] = [
      {
        id: 'laptop-1',
        name: 'Gaming Laptop',
        price: Money.create(35000, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 10,
      },
      {
        id: 'mouse-1',
        name: 'Gaming Mouse',
        price: Money.create(1500, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 50,
      },
      {
        id: 'keyboard-1',
        name: 'Mechanical Keyboard',
        price: Money.create(2500, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 25,
      },
      {
        id: 'headset-1',
        name: 'Gaming Headset',
        price: Money.create(3000, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 15,
      },
      {
        id: 'monitor-1',
        name: '27" Gaming Monitor',
        price: Money.create(12000, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 8,
      },
      {
        id: 'mousepad-1',
        name: 'Large Gaming Mousepad',
        price: Money.create(500, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 100,
      },
      {
        id: 'webcam-1',
        name: 'HD Webcam',
        price: Money.create(2000, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 20,
      },
      {
        id: 'speakers-1',
        name: 'Desktop Speakers',
        price: Money.create(1800, 'THB'),
        isActive: true,
        inStock: true,
        stockQuantity: 30,
      },
      // Out of stock product for testing
      {
        id: 'chair-1',
        name: 'Gaming Chair',
        price: Money.create(8000, 'THB'),
        isActive: true,
        inStock: false,
        stockQuantity: 0,
      },
      // Inactive product for testing
      {
        id: 'old-mouse',
        name: 'Old Mouse Model',
        price: Money.create(800, 'THB'),
        isActive: false,
        inStock: true,
        stockQuantity: 5,
      },
    ];

    testProducts.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  async getProduct(productId: string): Promise<ProductInfo | null> {
    return this.products.get(productId) || null;
  }

  async isProductAvailable(productId: string): Promise<boolean> {
    const product = this.products.get(productId);
    return product ? product.isActive && product.inStock : false;
  }

  async getProducts(productIds: string[]): Promise<Map<string, ProductInfo>> {
    const result = new Map<string, ProductInfo>();

    for (const productId of productIds) {
      const product = this.products.get(productId);
      if (product) {
        result.set(productId, product);
      }
    }

    return result;
  }

  async hasEnoughStock(productId: string, quantity: number): Promise<boolean> {
    const product = this.products.get(productId);
    if (!product || !product.isActive || !product.inStock) {
      return false;
    }

    return product.stockQuantity >= quantity;
  }

  // Additional utility methods for testing
  getAllProducts(): ProductInfo[] {
    return Array.from(this.products.values());
  }

  getAvailableProducts(): ProductInfo[] {
    return Array.from(this.products.values()).filter(
      (product) => product.isActive && product.inStock,
    );
  }

  addTestProduct(product: ProductInfo): void {
    this.products.set(product.id, product);
  }

  updateStock(productId: string, newQuantity: number): boolean {
    const product = this.products.get(productId);
    if (product) {
      product.stockQuantity = newQuantity;
      product.inStock = newQuantity > 0;
      return true;
    }
    return false;
  }

  reserveStock(productId: string, quantity: number): boolean {
    const product = this.products.get(productId);
    if (product && product.stockQuantity >= quantity) {
      product.stockQuantity -= quantity;
      product.inStock = product.stockQuantity > 0;
      return true;
    }
    return false;
  }

  releaseStock(productId: string, quantity: number): boolean {
    const product = this.products.get(productId);
    if (product) {
      product.stockQuantity += quantity;
      product.inStock = true;
      return true;
    }
    return false;
  }
}
