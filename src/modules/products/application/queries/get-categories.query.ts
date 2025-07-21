export class GetCategoriesQuery {
  constructor(
    public readonly filters?: {
      parentId?: string | null;
      isActive?: boolean;
      search?: string;
    },
    public readonly sort?: {
      field: 'name' | 'sortOrder' | 'createdAt' | 'updatedAt';
      direction: 'ASC' | 'DESC';
    },
    public readonly buildTree?: boolean,
    public readonly includeProductCount?: boolean,
  ) {}
}
