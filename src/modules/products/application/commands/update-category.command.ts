export class UpdateCategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly name?: string,
    public readonly slug?: string,
    public readonly description?: string,
    public readonly parentId?: string | null,
    public readonly imageUrl?: string,
    public readonly isActive?: boolean,
    public readonly sortOrder?: number,
  ) {}
}