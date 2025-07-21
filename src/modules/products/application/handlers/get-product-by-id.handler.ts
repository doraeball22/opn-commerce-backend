import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetProductByIdQuery } from '../queries/get-product-by-id.query';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery>
{
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(query: GetProductByIdQuery): Promise<Product> {
    const product = await this.productRepository.findById(query.productId);

    if (!product) {
      throw new NotFoundException(
        `Product with ID '${query.productId}' not found`,
      );
    }

    if (product.isDeleted()) {
      throw new NotFoundException(
        `Product with ID '${query.productId}' has been deleted`,
      );
    }

    return product;
  }
}
