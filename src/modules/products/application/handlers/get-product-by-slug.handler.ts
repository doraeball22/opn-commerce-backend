import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProductBySlugQuery } from '../queries/get-product-by-slug.query';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product.entity';

@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugHandler
  implements IQueryHandler<GetProductBySlugQuery>
{
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(query: GetProductBySlugQuery): Promise<Product | null> {
    return this.productRepository.findBySlug(query.slug);
  }
}
