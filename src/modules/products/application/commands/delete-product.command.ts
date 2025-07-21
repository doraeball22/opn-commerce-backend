export class DeleteProductCommand {
  constructor(
    public readonly productId: string,
    public readonly permanent: boolean = false,
  ) {}
}
