import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { GetCategoriesQuery } from '../queries/get-categories.query';
import { Category } from '../../domain/entities/category.entity';
import {
  CategoryRepository,
  CategoryTreeNode,
} from '../../domain/repositories/category.repository';

@Injectable()
@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    query: GetCategoriesQuery,
  ): Promise<Category[] | CategoryTreeNode[]> {
    if (query.buildTree) {
      return this.categoryRepository.buildTree(
        undefined,
        query.includeProductCount,
      );
    }

    return this.categoryRepository.findAll(query.filters, query.sort);
  }
}
