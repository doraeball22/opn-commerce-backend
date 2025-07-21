import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  CurrentUser,
  ICurrentUser,
} from '../../../../shared/auth';
import { Product } from '../../domain/entities/product.entity';
import {
  ProductFilters,
  ProductSortOptions,
} from '../../domain/repositories/product.repository';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { CreateProductCommand } from '../../application/commands/create-product.command';
import { UpdateProductCommand } from '../../application/commands/update-product.command';
import { DeleteProductCommand } from '../../application/commands/delete-product.command';
import { GetProductsQuery } from '../../application/queries/get-products.query';
import { GetProductByIdQuery } from '../../application/queries/get-product-by-id.query';
import { GetProductBySlugQuery } from '../../application/queries/get-product-by-slug.query';

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get products with filtering and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filter by stock availability',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'price', 'createdAt', 'averageRating'],
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort direction',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async getProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('inStock') inStock?: boolean,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const offset = (page - 1) * limit;

    const filters: ProductFilters = { isActive: true };
    if (search) filters.search = search;
    if (categoryId) filters.categoryIds = [categoryId];
    if (minPrice !== undefined) filters.minPrice = minPrice;
    if (maxPrice !== undefined) filters.maxPrice = maxPrice;
    if (inStock !== undefined) filters.inStock = inStock;

    const query = new GetProductsQuery(
      filters,
      { field: sortBy as ProductSortOptions['field'], direction: sortOrder },
      { offset, limit },
    );

    const result = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Products retrieved successfully',
      data: {
        products: result.products.map((product) =>
          this.formatProductResponse(product),
        ),
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
          hasMore: result.hasMore,
        },
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getProduct(@Param('id') id: string) {
    const query = new GetProductByIdQuery(id);
    const product = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Product retrieved successfully',
      data: this.formatProductResponse(product),
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getProductBySlug(@Param('slug') slug: string) {
    const query = new GetProductBySlugQuery(slug);
    const product = await this.queryBus.execute(query);

    if (!product) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Product not found',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Product retrieved successfully',
      data: this.formatProductResponse(product),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new product (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Product with SKU or slug already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: CreateProductDto,
  ) {
    const command = new CreateProductCommand(
      dto.name,
      dto.slug,
      dto.description,
      dto.shortDescription,
      dto.sku,
      dto.price,
      dto.currency,
      dto.salePrice,
      dto.stockQuantity,
      dto.manageStock,
      dto.weight,
      dto.dimensions,
      dto.attributes,
      dto.categoryIds,
      dto.images,
    );

    const product = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Product created successfully',
      data: this.formatProductResponse(product),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async updateProduct(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    const command = new UpdateProductCommand(
      id,
      dto.name,
      dto.description,
      dto.shortDescription,
      dto.price,
      dto.currency,
      dto.salePrice,
      dto.stockQuantity,
      dto.manageStock,
      dto.weight,
      dto.dimensions,
      dto.attributes,
      dto.categoryIds,
      dto.images,
    );

    const product = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
      data: this.formatProductResponse(product),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({
    name: 'permanent',
    required: false,
    type: Boolean,
    description: 'Permanently delete product',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async deleteProduct(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Query('permanent') permanent: boolean = false,
  ) {
    const command = new DeleteProductCommand(id, permanent);
    await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: permanent
        ? 'Product permanently deleted'
        : 'Product deleted successfully',
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
  })
  async getFeaturedProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    // This would be a specialized query in a real implementation
    const query = new GetProductsQuery(
      { isActive: true },
      { field: 'averageRating', direction: 'DESC' },
      { offset: 0, limit },
    );

    const result = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Featured products retrieved successfully',
      data: result.products
        .filter((p) => p.averageRating >= 4.0)
        .map((product) => this.formatProductResponse(product)),
    };
  }

  @Get('on-sale')
  @ApiOperation({ summary: 'Get products on sale' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Sale products retrieved successfully',
  })
  async getProductsOnSale(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const offset = (page - 1) * limit;

    const query = new GetProductsQuery(
      { isActive: true },
      { field: 'price', direction: 'ASC' },
      { offset, limit },
    );

    const result = await this.queryBus.execute(query);
    const saleProducts = result.products.filter((p) => p.isOnSale());

    return {
      statusCode: HttpStatus.OK,
      message: 'Sale products retrieved successfully',
      data: {
        products: saleProducts.map((product) =>
          this.formatProductResponse(product),
        ),
        pagination: {
          page,
          limit,
          total: saleProducts.length,
          pages: Math.ceil(saleProducts.length / limit),
          hasMore: offset + limit < saleProducts.length,
        },
      },
    };
  }

  private formatProductResponse(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku.getValue(),
      price: {
        amount: product.price.getAmount(),
        currency: product.price.getCurrency(),
        formatted: product.price.toDisplayString(),
      },
      salePrice: product.salePrice
        ? {
            amount: product.salePrice.getAmount(),
            currency: product.salePrice.getCurrency(),
            formatted: product.salePrice.toDisplayString(),
          }
        : null,
      effectivePrice: {
        amount: product.getEffectivePrice().getAmount(),
        currency: product.getEffectivePrice().getCurrency(),
        formatted: product.getEffectivePrice().toDisplayString(),
      },
      isOnSale: product.isOnSale(),
      stockQuantity: product.stockQuantity,
      manageStock: product.manageStock,
      inStock: product.isInStock(),
      status: {
        value: product.status.getValue(),
        display: product.status.getDisplayName(),
      },
      weight: product.weight
        ? {
            value: product.weight.getValue(),
            unit: product.weight.getUnit(),
            display: product.weight.toDisplayString(),
          }
        : null,
      dimensions: product.dimensions
        ? {
            length: product.dimensions.getLength(),
            width: product.dimensions.getWidth(),
            height: product.dimensions.getHeight(),
            unit: product.dimensions.getUnit(),
            display: product.dimensions.toDisplayString(),
          }
        : null,
      attributes: product.attributes,
      images: product.images,
      categoryIds: product.categoryIds,
      rating: {
        average: product.averageRating,
        count: product.reviewCount,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
