import { Money } from '../../domain/value-objects/money.vo';

export interface ProductInfo {
  id: string;
  name: string;
  price: Money;
  isActive: boolean;
  inStock: boolean;
  stockQuantity: number;
}

export interface IProductService {
  /**
   * Get product information by ID
   * @param productId - The product identifier
   * @returns Product information or null if not found
   */
  getProduct(productId: string): Promise<ProductInfo | null>;

  /**
   * Check if a product exists and is available for purchase
   * @param productId - The product identifier
   * @returns True if product exists and is available
   */
  isProductAvailable(productId: string): Promise<boolean>;

  /**
   * Get multiple products by their IDs
   * @param productIds - Array of product identifiers
   * @returns Map of product ID to product information
   */
  getProducts(productIds: string[]): Promise<Map<string, ProductInfo>>;

  /**
   * Check stock availability for a product
   * @param productId - The product identifier
   * @param quantity - Required quantity
   * @returns True if enough stock is available
   */
  hasEnoughStock(productId: string, quantity: number): Promise<boolean>;
}
