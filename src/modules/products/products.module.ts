import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { ProductsController } from './presentation/controllers/products.controller';
import { CategoriesController } from './presentation/controllers/categories.controller';

// Repository Interfaces
import { ProductRepository } from './domain/repositories/product.repository';
import { CategoryRepository } from './domain/repositories/category.repository';

// Repository Implementations
import { AdapterProductRepository } from './infrastructure/repositories/adapter-product.repository';
import { AdapterCategoryRepository } from './infrastructure/repositories/adapter-category.repository';

// Database Adapters
import { ProductsDatabaseAdapter } from './infrastructure/adapters/products-database.adapter';
import { MockProductsDatabaseAdapter } from './infrastructure/adapters/mock-products-database.adapter';

// Command Handlers
import { CreateProductHandler } from './application/handlers/create-product.handler';
import { UpdateProductHandler } from './application/handlers/update-product.handler';
import { DeleteProductHandler } from './application/handlers/delete-product.handler';
import { CreateCategoryHandler } from './application/handlers/create-category.handler';
import { UpdateCategoryHandler } from './application/handlers/update-category.handler';
import { DeleteCategoryHandler } from './application/handlers/delete-category.handler';

// Query Handlers
import { GetProductsHandler } from './application/handlers/get-products.handler';
import { GetProductByIdHandler } from './application/handlers/get-product-by-id.handler';
import { GetProductBySlugHandler } from './application/handlers/get-product-by-slug.handler';
import { GetCategoriesHandler } from './application/handlers/get-categories.handler';

// Command Handlers Array
const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];

// Query Handlers Array
const QueryHandlers = [
  GetProductsHandler,
  GetProductByIdHandler,
  GetProductBySlugHandler,
  GetCategoriesHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [ProductsController, CategoriesController],
  providers: [
    // Database Adapters
    MockProductsDatabaseAdapter,

    // Database Adapter Provider
    {
      provide: 'ProductsDatabaseAdapter',
      useFactory: (mockAdapter: MockProductsDatabaseAdapter) => {
        // For now, always use mock adapter
        // In the future, this could be configurable like the users module
        mockAdapter.connect().catch(console.error);
        return mockAdapter;
      },
      inject: [MockProductsDatabaseAdapter],
    },

    // Repository Implementations
    {
      provide: 'ProductRepository',
      useClass: AdapterProductRepository,
    },
    {
      provide: 'CategoryRepository',
      useClass: AdapterCategoryRepository,
    },

    // Repository Classes
    AdapterProductRepository,
    AdapterCategoryRepository,

    // Command and Query Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    'ProductRepository',
    'CategoryRepository',
    'ProductsDatabaseAdapter',
  ],
})
export class ProductsModule {}
