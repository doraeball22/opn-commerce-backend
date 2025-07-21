export class GetProductsQuery {
  constructor(
    public readonly filters?: {
      categoryIds?: string[];
      status?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      isActive?: boolean;
    },
    public readonly sort?: {
      field:
        | 'name'
        | 'price'
        | 'createdAt'
        | 'updatedAt'
        | 'averageRating'
        | 'reviewCount';
      direction: 'ASC' | 'DESC';
    },
    public readonly pagination?: {
      offset: number;
      limit: number;
    },
  ) {}
}
