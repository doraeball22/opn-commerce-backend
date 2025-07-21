export class DeleteCategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly permanent: boolean = false,
  ) {}
}
