import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  CurrentUser,
  ICurrentUser,
} from '../../../../shared/auth';
import { CartService } from '../../application/services/cart.service';
import { CreateCartDto } from '../../application/dto/create-cart.dto';
import { AddItemDto } from '../../application/dto/add-item.dto';
import { UpdateItemDto } from '../../application/dto/update-item.dto';
import {
  ApplyFixedDiscountDto,
  ApplyPercentageDiscountDto,
} from '../../application/dto/apply-discount.dto';
import { ApplyFreebieDto } from '../../application/dto/apply-freebie.dto';
import { CartResponseDto } from '../../application/dto/cart-response.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ===============================================
  // PUBLIC ENDPOINTS (No Authentication Required)
  // ===============================================

  @Post()
  @ApiOperation({ summary: 'Create a new cart' })
  @ApiResponse({
    status: 201,
    description: 'Cart created successfully',
    type: CartResponseDto,
  })
  createCart(@Body() createCartDto: CreateCartDto): CartResponseDto {
    const cart = this.cartService.createCart();
    const summary = this.cartService.getCartSummary(cart.getId());
    return CartResponseDto.fromCartSummary(summary, createCartDto.userId);
  }

  @Get(':cartId')
  @ApiOperation({ summary: 'Get cart by ID' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  getCart(
    @Param('cartId') cartId: string,
    @Query('userId') userId?: string,
  ): CartResponseDto {
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carts' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of carts',
    type: [CartResponseDto],
  })
  getAllCarts(@Query('userId') userId?: string): CartResponseDto[] {
    if (userId) {
      // Return only carts for the specified user
      const userCarts = this.cartService.findUserCarts(userId);
      return userCarts.map((cart) => {
        const summary = this.cartService.getCartSummary(cart.getId());
        return CartResponseDto.fromCartSummary(summary, userId);
      });
    }

    const carts = this.cartService.getAllCarts();
    return carts.map((cart) => {
      const summary = this.cartService.getCartSummary(cart.getId());
      return CartResponseDto.fromCartSummary(summary, userId);
    });
  }

  @Get('user/:userId/current')
  @ApiOperation({
    summary: 'Get current active cart for user',
    description:
      "Returns the user's most recent non-empty cart, or creates a new one if none exists. Perfect for frontend integration when user logs in.",
  })
  @ApiParam({ name: 'userId', description: 'User unique identifier' })
  @ApiResponse({
    status: 200,
    description: "User's current cart (existing or newly created)",
    type: CartResponseDto,
  })
  getUserCurrentCart(@Param('userId') userId: string): CartResponseDto {
    const cart = this.cartService.getOrCreateUserCart(userId);
    const summary = this.cartService.getCartSummary(cart.getId());
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  // ===============================================
  // AUTHENTICATED USER ENDPOINTS
  // ===============================================

  @Get('my-cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user cart (authenticated)',
    description:
      "Get the authenticated user's current cart. Creates a new cart if none exists. Requires JWT token in Authorization header.",
  })
  @ApiResponse({
    status: 200,
    description: "User's current cart",
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  getMyCart(@CurrentUser() user: ICurrentUser): CartResponseDto {
    const cart = this.cartService.getOrCreateUserCart(user.id);
    const summary = this.cartService.getCartSummary(cart.getId());
    return CartResponseDto.fromCartSummary(summary, user.id);
  }

  @Post('my-cart/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add item to current user cart (authenticated)',
    description:
      "Add an item to the authenticated user's cart. Creates a new cart if none exists. Requires JWT token in Authorization header.",
  })
  @ApiResponse({
    status: 201,
    description: "Item added to user's cart",
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async addItemToMyCart(
    @CurrentUser() user: ICurrentUser,
    @Body() addItemDto: AddItemDto,
  ): Promise<CartResponseDto> {
    const cart = this.cartService.getOrCreateUserCart(user.id);
    await this.cartService.addItem(
      cart.getId(),
      addItemDto.productId,
      addItemDto.quantity,
    );
    const summary = this.cartService.getCartSummary(cart.getId());
    return CartResponseDto.fromCartSummary(summary, user.id);
  }

  @Put('my-cart/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update item in current user cart (authenticated)',
    description:
      "Update quantity of an item in the authenticated user's cart. Requires JWT token in Authorization header.",
  })
  @ApiParam({ name: 'itemId', description: 'Cart item unique identifier' })
  @ApiResponse({
    status: 200,
    description: "Item updated in user's cart",
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItemInMyCart(
    @CurrentUser() user: ICurrentUser,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<CartResponseDto> {
    const cart = this.cartService.getOrCreateUserCart(user.id);
    await this.cartService.updateItem(
      cart.getId(),
      itemId,
      updateItemDto.quantity,
    );
    const summary = this.cartService.getCartSummary(cart.getId());
    return CartResponseDto.fromCartSummary(summary, user.id);
  }

  @Delete('my-cart/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove item from current user cart (authenticated)',
    description:
      "Remove an item from the authenticated user's cart. Requires JWT token in Authorization header.",
  })
  @ApiParam({ name: 'itemId', description: 'Cart item unique identifier' })
  @ApiResponse({
    status: 200,
    description: "Item removed from user's cart",
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  removeItemFromMyCart(
    @CurrentUser() user: ICurrentUser,
    @Param('itemId') itemId: string,
  ): CartResponseDto {
    const cart = this.cartService.getOrCreateUserCart(user.id);
    this.cartService.removeItem(cart.getId(), itemId);
    const summary = this.cartService.getCartSummary(cart.getId());
    return CartResponseDto.fromCartSummary(summary, user.id);
  }

  @Delete('my-cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Clear current user cart (authenticated)',
    description:
      "Remove all items from the authenticated user's cart. Requires JWT token in Authorization header.",
  })
  @ApiResponse({
    status: 200,
    description: "User's cart cleared",
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  clearMyCart(@CurrentUser() user: ICurrentUser): CartResponseDto {
    const cart = this.cartService.getOrCreateUserCart(user.id);
    this.cartService.clearCart(cart.getId());
    const summary = this.cartService.getCartSummary(cart.getId());
    return CartResponseDto.fromCartSummary(summary, user.id);
  }

  @Post(':cartId/items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart or product not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async addItem(
    @Param('cartId') cartId: string,
    @Body() addItemDto: AddItemDto,
    @Query('userId') userId?: string,
  ): Promise<CartResponseDto> {
    await this.cartService.addItem(
      cartId,
      addItemDto.productId,
      addItemDto.quantity,
    );
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Put(':cartId/items/:productId')
  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiParam({ name: 'productId', description: 'Product unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Item quantity updated',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart or product not found' })
  async updateItem(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
    @Body() updateItemDto: UpdateItemDto,
    @Query('userId') userId?: string,
  ): Promise<CartResponseDto> {
    await this.cartService.updateItem(
      cartId,
      productId,
      updateItemDto.quantity,
    );
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Delete(':cartId/items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiParam({ name: 'productId', description: 'Product unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  removeItem(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
    @Query('userId') userId?: string,
  ): CartResponseDto {
    this.cartService.removeItem(cartId, productId);
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Delete(':cartId')
  @ApiOperation({ summary: 'Delete cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({ status: 204, description: 'Cart deleted successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCart(@Param('cartId') cartId: string): void {
    this.cartService.destroyCart(cartId);
  }

  @Post(':cartId/discounts/fixed')
  @ApiOperation({ summary: 'Apply fixed discount to cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Fixed discount applied',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  applyFixedDiscount(
    @Param('cartId') cartId: string,
    @Body() discountDto: ApplyFixedDiscountDto,
    @Query('userId') userId?: string,
  ): CartResponseDto {
    this.cartService.applyFixedDiscount(
      cartId,
      discountDto.name,
      discountDto.amount,
    );
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Post(':cartId/discounts/percentage')
  @ApiOperation({ summary: 'Apply percentage discount to cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Percentage discount applied',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  applyPercentageDiscount(
    @Param('cartId') cartId: string,
    @Body() discountDto: ApplyPercentageDiscountDto,
    @Query('userId') userId?: string,
  ): CartResponseDto {
    this.cartService.applyPercentageDiscount(
      cartId,
      discountDto.name,
      discountDto.percentage,
      discountDto.maxAmount,
    );
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Delete(':cartId/discounts/:discountName')
  @ApiOperation({ summary: 'Remove discount from cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiParam({ name: 'discountName', description: 'Discount name' })
  @ApiResponse({
    status: 200,
    description: 'Discount removed',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  removeDiscount(
    @Param('cartId') cartId: string,
    @Param('discountName') discountName: string,
    @Query('userId') userId?: string,
  ): CartResponseDto {
    this.cartService.removeDiscount(cartId, discountName);
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Post(':cartId/freebies')
  @ApiOperation({ summary: 'Apply freebie rule to cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Freebie applied',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  applyFreebie(
    @Param('cartId') cartId: string,
    @Body() freebieDto: ApplyFreebieDto,
    @Query('userId') userId?: string,
  ): CartResponseDto {
    this.cartService.applyFreebie(
      cartId,
      freebieDto.triggerProductId,
      freebieDto.freebieProductId,
      freebieDto.quantity,
    );
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Delete(':cartId/freebies/:triggerProductId')
  @ApiOperation({ summary: 'Remove freebie rule from cart' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiParam({ name: 'triggerProductId', description: 'Trigger product ID' })
  @ApiResponse({
    status: 200,
    description: 'Freebie removed',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  removeFreebie(
    @Param('cartId') cartId: string,
    @Param('triggerProductId') triggerProductId: string,
    @Query('userId') userId?: string,
  ): CartResponseDto {
    this.cartService.removeFreebie(cartId, triggerProductId);
    const summary = this.cartService.getCartSummary(cartId);
    return CartResponseDto.fromCartSummary(summary, userId);
  }

  @Get(':cartId/utilities/has-product/:productId')
  @ApiOperation({ summary: 'Check if cart contains product' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiParam({ name: 'productId', description: 'Product unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Product existence check result',
    schema: { type: 'object', properties: { hasProduct: { type: 'boolean' } } },
  })
  hasProduct(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
  ): { hasProduct: boolean } {
    return {
      hasProduct: this.cartService.hasProduct(cartId, productId),
    };
  }

  @Get(':cartId/utilities/is-empty')
  @ApiOperation({ summary: 'Check if cart is empty' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Cart empty check result',
    schema: { type: 'object', properties: { isEmpty: { type: 'boolean' } } },
  })
  isEmpty(@Param('cartId') cartId: string): { isEmpty: boolean } {
    return {
      isEmpty: this.cartService.isEmpty(cartId),
    };
  }

  @Get(':cartId/utilities/counts')
  @ApiOperation({ summary: 'Get cart item counts' })
  @ApiParam({ name: 'cartId', description: 'Cart unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Cart count information',
    schema: {
      type: 'object',
      properties: {
        uniqueItemCount: { type: 'number' },
        totalItemCount: { type: 'number' },
      },
    },
  })
  getCounts(@Param('cartId') cartId: string): {
    uniqueItemCount: number;
    totalItemCount: number;
  } {
    return {
      uniqueItemCount: this.cartService.getUniqueItemCount(cartId),
      totalItemCount: this.cartService.getTotalItemCount(cartId),
    };
  }
}
