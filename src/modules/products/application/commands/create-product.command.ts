export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly shortDescription: string,
    public readonly sku: string,
    public readonly price: number,
    public readonly currency: string = 'THB',
    public readonly salePrice?: number,
    public readonly stockQuantity: number = 0,
    public readonly manageStock: boolean = true,
    public readonly weight?: { value: number; unit: string },
    public readonly dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    },
    public readonly attributes?: { [key: string]: string | string[] },
    public readonly categoryIds: string[] = [],
    public readonly images?: { featuredImage?: string; gallery: string[] },
  ) {}
}
