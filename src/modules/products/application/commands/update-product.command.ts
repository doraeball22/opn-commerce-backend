export class UpdateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly shortDescription?: string,
    public readonly price?: number,
    public readonly currency?: string,
    public readonly salePrice?: number,
    public readonly stockQuantity?: number,
    public readonly manageStock?: boolean,
    public readonly weight?: { value: number; unit: string },
    public readonly dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    },
    public readonly attributes?: { [key: string]: string | string[] },
    public readonly categoryIds?: string[],
    public readonly images?: { featuredImage?: string; gallery: string[] },
  ) {}
}
