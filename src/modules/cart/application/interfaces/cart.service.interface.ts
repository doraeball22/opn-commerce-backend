import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';
import { Money } from '../../domain/value-objects/money.vo';

export interface CartSummary {
  cartId: string;
  items: CartItem[];
  regularItems: CartItem[];
  freebieItems: CartItem[];
  subtotal: Money;
  totalDiscount: Money;
  total: Money;
  uniqueItemCount: number;
  totalItemCount: number;
  isEmpty: boolean;
  discounts: Array<{
    name: string;
    type: string;
    description: string;
    calculatedAmount: Money;
    savings: string;
  }>;
  freebies: Array<{
    freebieProduct: string;
    triggerProduct: string;
    ruleName: string;
    savings: Money;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartService {
  // Basic Operations
  createCart(): Cart;
  addItem(cartId: string, productId: string, quantity: number): Promise<void>;
  updateItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void>;
  removeItem(cartId: string, productId: string): void;
  destroyCart(cartId: string): void;

  // Utilities
  hasProduct(cartId: string, productId: string): boolean;
  isEmpty(cartId: string): boolean;
  listItems(cartId: string): CartItem[];
  getUniqueItemCount(cartId: string): number;
  getTotalItemCount(cartId: string): number;

  // Discount Operations
  applyFixedDiscount(cartId: string, name: string, amount: number): void;
  applyPercentageDiscount(
    cartId: string,
    name: string,
    percentage: number,
    maxAmount?: number,
  ): void;
  removeDiscount(cartId: string, name: string): void;

  // Freebie Operations
  applyFreebie(
    cartId: string,
    triggerProductId: string,
    freebieProductId: string,
    quantity?: number,
  ): void;
  removeFreebie(cartId: string, name: string): void;

  // Information
  getCart(cartId: string): Cart;
  getCartSummary(cartId: string): CartSummary;
  getAllCarts(): Cart[];
}
