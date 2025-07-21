import { Module } from '@nestjs/common';

// Controllers
import { CartController } from './presentation/controllers/cart.controller';

// Services
import { CartService } from './application/services/cart.service';
import { DiscountService } from './domain/services/discount.service';
import { FreebieService } from './domain/services/freebie.service';
import { MockProductService } from './infrastructure/services/mock-product.service';

// Interfaces
import { IProductService } from './application/interfaces/product.service.interface';
import { ICartService } from './application/interfaces/cart.service.interface';

@Module({
  controllers: [CartController],
  providers: [
    // Domain Services
    DiscountService,
    FreebieService,

    // Infrastructure Services
    MockProductService,

    // Application Services
    CartService,

    // Service Providers
    {
      provide: 'IProductService',
      useClass: MockProductService,
    },
    {
      provide: 'ICartService',
      useClass: CartService,
    },
  ],
  exports: [
    CartService,
    DiscountService,
    FreebieService,
    'IProductService',
    'ICartService',
  ],
})
export class CartModule {}
