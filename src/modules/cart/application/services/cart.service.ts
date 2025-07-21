import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';
import { DiscountService } from '../../domain/services/discount.service';
import { FreebieService } from '../../domain/services/freebie.service';
import { IProductService } from '../interfaces/product.service.interface';
import {
  ICartService,
  CartSummary,
} from '../interfaces/cart.service.interface';

@Injectable()
export class CartService implements ICartService {
  private readonly carts = new Map<string, Cart>();
  private readonly userCarts = new Map<string, string[]>(); // userId -> cartIds[]

  constructor(
    private readonly discountService: DiscountService,
    private readonly freebieService: FreebieService,
    @Inject('IProductService')
    private readonly productService: IProductService,
  ) {}

  // Basic Operations
  createCart(userId?: string): Cart {
    const cart = Cart.create();
    this.carts.set(cart.getId(), cart);

    // Track user association if provided
    if (userId) {
      this.associateCartWithUser(cart.getId(), userId);
    }

    return cart;
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const cart = this.getCartOrThrow(cartId);

    // Validate product exists and is available
    const product = await this.productService.getProduct(productId);
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (!product.isActive) {
      throw new BadRequestException(`Product ${productId} is not available`);
    }

    if (!product.inStock) {
      throw new BadRequestException(`Product ${productId} is out of stock`);
    }

    // Check stock availability
    const hasStock = await this.productService.hasEnoughStock(
      productId,
      quantity,
    );
    if (!hasStock) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}`,
      );
    }

    cart.addItem(productId, quantity, product.price);
  }

  async updateItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const cart = this.getCartOrThrow(cartId);

    if (!cart.hasProduct(productId)) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    // Validate new quantity against stock
    const hasStock = await this.productService.hasEnoughStock(
      productId,
      quantity,
    );
    if (!hasStock) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}`,
      );
    }

    cart.updateItem(productId, quantity);
  }

  removeItem(cartId: string, productId: string): void {
    const cart = this.getCartOrThrow(cartId);

    if (!cart.hasProduct(productId)) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    cart.removeItem(productId);
  }

  destroyCart(cartId: string): void {
    if (!this.carts.has(cartId)) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    this.carts.delete(cartId);
  }

  // Utilities
  hasProduct(cartId: string, productId: string): boolean {
    const cart = this.getCartOrThrow(cartId);
    return cart.hasProduct(productId);
  }

  isEmpty(cartId: string): boolean {
    const cart = this.getCartOrThrow(cartId);
    return cart.isEmpty();
  }

  listItems(cartId: string): CartItem[] {
    const cart = this.getCartOrThrow(cartId);
    return cart.getItems();
  }

  getUniqueItemCount(cartId: string): number {
    const cart = this.getCartOrThrow(cartId);
    return cart.getUniqueItemCount();
  }

  getTotalItemCount(cartId: string): number {
    const cart = this.getCartOrThrow(cartId);
    return cart.getTotalItemCount();
  }

  // Discount Operations
  applyFixedDiscount(cartId: string, name: string, amount: number): void {
    const cart = this.getCartOrThrow(cartId);

    if (cart.hasDiscount(name)) {
      throw new BadRequestException(`Discount '${name}' is already applied`);
    }

    const discount = this.discountService.createFixedDiscount(name, amount);
    cart.applyDiscount(discount);
  }

  applyPercentageDiscount(
    cartId: string,
    name: string,
    percentage: number,
    maxAmount?: number,
  ): void {
    const cart = this.getCartOrThrow(cartId);

    if (cart.hasDiscount(name)) {
      throw new BadRequestException(`Discount '${name}' is already applied`);
    }

    const discount = this.discountService.createPercentageDiscount(
      name,
      percentage,
      maxAmount,
    );
    cart.applyDiscount(discount);
  }

  removeDiscount(cartId: string, name: string): void {
    const cart = this.getCartOrThrow(cartId);

    if (!cart.hasDiscount(name)) {
      throw new NotFoundException(`Discount '${name}' not found`);
    }

    cart.removeDiscount(name);
  }

  // Freebie Operations
  applyFreebie(
    cartId: string,
    triggerProductId: string,
    freebieProductId: string,
    quantity: number = 1,
  ): void {
    const cart = this.getCartOrThrow(cartId);

    const ruleName = `Buy ${triggerProductId} get ${freebieProductId}`;
    const rule = this.freebieService.createFreebieRule(
      ruleName,
      triggerProductId,
      freebieProductId,
      quantity,
    );

    // Check for conflicts
    const conflicts = this.freebieService.checkRuleConflicts(
      cart.getFreebieRules(),
      rule,
    );
    if (conflicts.length > 0) {
      throw new BadRequestException(
        `Freebie rule conflicts: ${conflicts.join(', ')}`,
      );
    }

    cart.applyFreebie(rule);
  }

  removeFreebie(cartId: string, name: string): void {
    const cart = this.getCartOrThrow(cartId);
    cart.removeFreebie(name);
  }

  // Information
  getCart(cartId: string): Cart {
    return this.getCartOrThrow(cartId);
  }

  getCartSummary(cartId: string): CartSummary {
    const cart = this.getCartOrThrow(cartId);
    const activeFreebies = this.freebieService.getActiveFreebies(cart);

    return {
      cartId: cart.getId(),
      items: cart.getItems(),
      regularItems: cart.getRegularItems(),
      freebieItems: cart.getFreebieItems(),
      subtotal: cart.getSubtotal(),
      totalDiscount: cart.getTotalDiscount(),
      total: cart.getTotal(),
      uniqueItemCount: cart.getUniqueItemCount(),
      totalItemCount: cart.getTotalItemCount(),
      isEmpty: cart.isEmpty(),
      discounts: cart
        .getDiscounts()
        .map((discount) =>
          this.discountService.getDiscountInfo(discount, cart.getSubtotal()),
        ),
      freebies: activeFreebies.map((freebie) => ({
        freebieProduct: freebie.freebieItem.getProductId().getValue(),
        triggerProduct: freebie.triggerProduct,
        ruleName: freebie.ruleName,
        savings: freebie.savings,
      })),
      createdAt: cart.getCreatedAt(),
      updatedAt: cart.getUpdatedAt(),
    };
  }

  getAllCarts(): Cart[] {
    return Array.from(this.carts.values());
  }

  // User-specific cart methods for frontend integration
  private associateCartWithUser(cartId: string, userId: string): void {
    if (!this.userCarts.has(userId)) {
      this.userCarts.set(userId, []);
    }
    const userCartIds = this.userCarts.get(userId)!;
    if (!userCartIds.includes(cartId)) {
      userCartIds.push(cartId);
    }
  }

  findUserCarts(userId: string): Cart[] {
    const cartIds = this.userCarts.get(userId) || [];
    return cartIds
      .map((cartId) => this.carts.get(cartId))
      .filter((cart): cart is Cart => cart !== undefined);
  }

  findUserActiveCart(userId: string): Cart | null {
    const userCarts = this.findUserCarts(userId);

    // Return the most recent non-empty cart, or the most recent cart if all are empty
    const nonEmptyCarts = userCarts.filter((cart) => !cart.isEmpty());

    if (nonEmptyCarts.length > 0) {
      // Return the most recently updated non-empty cart
      return nonEmptyCarts.reduce((latest, cart) =>
        cart.getUpdatedAt() > latest.getUpdatedAt() ? cart : latest,
      );
    }

    // If all carts are empty, return the most recently created one
    if (userCarts.length > 0) {
      return userCarts.reduce((latest, cart) =>
        cart.getCreatedAt() > latest.getCreatedAt() ? cart : latest,
      );
    }

    return null;
  }

  getOrCreateUserCart(userId: string): Cart {
    const activeCart = this.findUserActiveCart(userId);
    if (activeCart) {
      return activeCart;
    }

    // Create new cart if user has no active cart
    return this.createCart(userId);
  }

  // Additional utility methods
  clearCart(cartId: string): void {
    const cart = this.getCartOrThrow(cartId);
    cart.clear();
  }

  async validateCartItems(cartId: string): Promise<
    Array<{
      productId: string;
      issue: string;
      severity: 'warning' | 'error';
    }>
  > {
    const cart = this.getCartOrThrow(cartId);
    const issues: Array<{
      productId: string;
      issue: string;
      severity: 'warning' | 'error';
    }> = [];

    const regularItems = cart.getRegularItems();
    const productIds = regularItems.map((item) =>
      item.getProductId().getValue(),
    );
    const products = await this.productService.getProducts(productIds);

    for (const item of regularItems) {
      const productId = item.getProductId().getValue();
      const product = products.get(productId);

      if (!product) {
        issues.push({
          productId,
          issue: 'Product no longer exists',
          severity: 'error',
        });
        continue;
      }

      if (!product.isActive) {
        issues.push({
          productId,
          issue: 'Product is no longer available',
          severity: 'error',
        });
        continue;
      }

      if (!product.inStock) {
        issues.push({
          productId,
          issue: 'Product is out of stock',
          severity: 'error',
        });
        continue;
      }

      const hasEnoughStock = await this.productService.hasEnoughStock(
        productId,
        item.getQuantity().getValue(),
      );

      if (!hasEnoughStock) {
        issues.push({
          productId,
          issue: `Insufficient stock (requested: ${item.getQuantity().getValue()}, available: ${product.stockQuantity})`,
          severity: 'warning',
        });
      }

      // Check if price has changed
      if (!item.getUnitPrice().equals(product.price)) {
        issues.push({
          productId,
          issue: `Price has changed from ${item.getUnitPrice().toString()} to ${product.price.toString()}`,
          severity: 'warning',
        });
      }
    }

    return issues;
  }

  getCartStatistics(): {
    totalCarts: number;
    emptyCarts: number;
    activeCarts: number;
    totalItems: number;
    averageItemsPerCart: number;
  } {
    const carts = this.getAllCarts();
    const totalCarts = carts.length;
    const emptyCarts = carts.filter((cart) => cart.isEmpty()).length;
    const activeCarts = totalCarts - emptyCarts;
    const totalItems = carts.reduce(
      (sum, cart) => sum + cart.getTotalItemCount(),
      0,
    );
    const averageItemsPerCart = totalCarts > 0 ? totalItems / totalCarts : 0;

    return {
      totalCarts,
      emptyCarts,
      activeCarts,
      totalItems,
      averageItemsPerCart,
    };
  }

  private getCartOrThrow(cartId: string): Cart {
    const cart = this.carts.get(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }
    return cart;
  }
}
