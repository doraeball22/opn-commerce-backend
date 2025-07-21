import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { GetProductsQuery } from '../queries/get-products.query';
import {
  ProductRepository,
  ProductSearchResult,
} from '../../domain/repositories/product.repository';

@Injectable()
@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(query: GetProductsQuery): Promise<ProductSearchResult> {
    return this.productRepository.findAll(
      query.filters,
      query.sort,
      query.pagination,
    );
  }
}
