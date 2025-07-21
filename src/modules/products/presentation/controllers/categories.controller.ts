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
  ParseBoolPipe,
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
import { Category } from '../../domain/entities/category.entity';
import { Product } from '../../domain/entities/product.entity';
import {
  CategoryFilters,
  CategorySortOptions,
  CategoryTreeNode,
} from '../../domain/repositories/category.repository';

interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryTreeNodeResponseDto {
  category: CategoryResponseDto;
  level: number;
  hasChildren: boolean;
  productCount?: number;
  children: CategoryTreeNodeResponseDto[];
}
import { CreateCategoryDto } from '../../application/dto/create-category.dto';
import { UpdateCategoryDto } from '../../application/dto/update-category.dto';
import { CreateCategoryCommand } from '../../application/commands/create-category.command';
import { UpdateCategoryCommand } from '../../application/commands/update-category.command';
import { DeleteCategoryCommand } from '../../application/commands/delete-category.command';
import { GetCategoriesQuery } from '../../application/queries/get-categories.query';
import { GetProductsQuery } from '../../application/queries/get-products.query';

@ApiTags('Categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get categories' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter by parent category ID',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'tree',
    required: false,
    type: Boolean,
    description: 'Return as tree structure',
  })
  @ApiQuery({
    name: 'includeProductCount',
    required: false,
    type: Boolean,
    description: 'Include product counts',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'sortOrder', 'createdAt'],
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort direction',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories(
    @Query('parentId') parentId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('tree', new DefaultValuePipe(false), ParseBoolPipe)
    tree: boolean = false,
    @Query('includeProductCount', new DefaultValuePipe(false), ParseBoolPipe)
    includeProductCount: boolean = false,
    @Query('sortBy') sortBy: string = 'sortOrder',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    const filters: CategoryFilters = {};
    if (parentId !== undefined)
      filters.parentId = parentId === 'null' ? null : parentId;
    if (search) filters.search = search;
    if (isActive !== undefined) filters.isActive = isActive;

    const query = new GetCategoriesQuery(
      filters,
      { field: sortBy as CategorySortOptions['field'], direction: sortOrder },
      tree,
      includeProductCount,
    );

    const result = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Categories retrieved successfully',
      data: tree
        ? result.map((node: CategoryTreeNode) =>
            this.formatCategoryTreeNode(node),
          )
        : result.map((category: Category) =>
            this.formatCategoryResponse(category),
          ),
    };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  @ApiQuery({
    name: 'includeProductCount',
    required: false,
    type: Boolean,
    description: 'Include product counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Category tree retrieved successfully',
  })
  async getCategoryTree(
    @Query('includeProductCount', new DefaultValuePipe(false), ParseBoolPipe)
    includeProductCount: boolean = false,
  ) {
    const query = new GetCategoriesQuery(
      undefined,
      { field: 'sortOrder', direction: 'ASC' },
      true,
      includeProductCount,
    );

    const result = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Category tree retrieved successfully',
      data: result.map((node: CategoryTreeNode) =>
        this.formatCategoryTreeNode(node),
      ),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async getCategory(@Param('id') id: string) {
    // For now, we'll get all categories and find the one we need
    // In a real implementation, this would be a specific query
    const query = new GetCategoriesQuery();
    const categories = (await this.queryBus.execute(query)) as Category[];

    const category = categories.find((c) => c.id === id);
    if (!category) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Category not found',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Category retrieved successfully',
      data: this.formatCategoryResponse(category),
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async getCategoryBySlug(@Param('slug') slug: string) {
    const query = new GetCategoriesQuery({ search: slug });
    const categories = (await this.queryBus.execute(query)) as Category[];

    const category = categories.find((c) => c.slug === slug);
    if (!category) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Category not found',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Category retrieved successfully',
      data: this.formatCategoryResponse(category),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new category (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with slug already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: CreateCategoryDto,
  ) {
    const command = new CreateCategoryCommand(
      dto.name,
      dto.slug,
      dto.description,
      dto.parentId,
      dto.imageUrl,
      dto.sortOrder,
    );

    const category = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Category created successfully',
      data: this.formatCategoryResponse(category),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async updateCategory(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const command = new UpdateCategoryCommand(
      id,
      dto.name,
      dto.slug,
      dto.description,
      dto.parentId,
      dto.imageUrl,
      dto.isActive,
      dto.sortOrder,
    );

    const category = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Category updated successfully',
      data: this.formatCategoryResponse(category),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({
    name: 'permanent',
    required: false,
    type: Boolean,
    description: 'Permanently delete category',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async deleteCategory(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Query('permanent', new DefaultValuePipe(false), ParseBoolPipe)
    permanent: boolean = false,
  ) {
    const command = new DeleteCategoryCommand(id, permanent);

    await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: `Category ${permanent ? 'permanently deleted' : 'deleted'} successfully`,
    };
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products in category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({
    name: 'includeSubcategories',
    required: false,
    type: Boolean,
    description: 'Include products from subcategories',
  })
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
    description: 'Category products retrieved successfully',
  })
  async getCategoryProducts(
    @Param('id') id: string,
    @Query('includeSubcategories', new DefaultValuePipe(false), ParseBoolPipe)
    includeSubcategories: boolean = false,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    // First verify category exists
    const categoriesQuery = new GetCategoriesQuery({ search: id });
    const categories = await this.queryBus.execute(categoriesQuery);
    const category = categories.find((c: Category) => c.id === id);

    if (!category) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Category not found',
      };
    }

    // Get products in this category
    const productsQuery = new GetProductsQuery(
      {
        categoryIds: [id],
        isActive: true,
      },
      { field: 'name', direction: 'ASC' },
      { offset: (page - 1) * limit, limit },
    );

    const result = await this.queryBus.execute(productsQuery);

    return {
      statusCode: HttpStatus.OK,
      message: 'Category products retrieved successfully', // Updated implementation
      data: {
        category: this.formatCategoryResponse(category),
        products: result.products.map((product: Product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price
            ? {
                amount: product.price.getAmount(),
                currency: product.price.getCurrency(),
              }
            : null,
          salePrice: product.salePrice
            ? {
                amount: product.salePrice.getAmount(),
                currency: product.salePrice.getCurrency(),
              }
            : null,
          status: product.status,
          imageUrl: product.getMainImage(),
          shortDescription: product.shortDescription,
        })),
        pagination: result.pagination,
        total: result.total,
      },
    };
  }

  private formatCategoryResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private formatCategoryTreeNode(
    node: CategoryTreeNode,
  ): CategoryTreeNodeResponseDto {
    return {
      category: this.formatCategoryResponse(node.category),
      level: node.level,
      hasChildren: node.hasChildren,
      productCount: node.productCount,
      children: node.children.map((child: CategoryTreeNode) =>
        this.formatCategoryTreeNode(child),
      ),
    };
  }
}
