import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUrl,
  Min,
  Max,
  ValidateNested,
  IsObject,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class WeightDto {
  @ApiProperty({ description: 'Weight value', example: 2.5 })
  @IsNumber({}, { message: 'Weight value must be a number' })
  @Min(0, { message: 'Weight must be positive' })
  value: number;

  @ApiProperty({
    description: 'Weight unit',
    example: 'kg',
    enum: ['g', 'kg', 'lb', 'oz'],
  })
  @IsString()
  @Matches(/^(g|kg|lb|oz)$/, {
    message: 'Weight unit must be one of: g, kg, lb, oz',
  })
  unit: string;
}

class DimensionsDto {
  @ApiProperty({ description: 'Length', example: 30 })
  @IsNumber({}, { message: 'Length must be a number' })
  @Min(0, { message: 'Length must be positive' })
  length: number;

  @ApiProperty({ description: 'Width', example: 20 })
  @IsNumber({}, { message: 'Width must be a number' })
  @Min(0, { message: 'Width must be positive' })
  width: number;

  @ApiProperty({ description: 'Height', example: 15 })
  @IsNumber({}, { message: 'Height must be a number' })
  @Min(0, { message: 'Height must be positive' })
  height: number;

  @ApiProperty({
    description: 'Dimension unit',
    example: 'cm',
    enum: ['mm', 'cm', 'm', 'in', 'ft'],
  })
  @IsString()
  @Matches(/^(mm|cm|m|in|ft)$/, {
    message: 'Dimension unit must be one of: mm, cm, m, in, ft',
  })
  unit: string;
}

class ProductImagesDto {
  @ApiPropertyOptional({
    description: 'Featured image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Featured image must be a valid URL' })
  featuredImage?: string;

  @ApiPropertyOptional({
    description: 'Gallery image URLs',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Gallery must be an array' })
  @IsUrl({}, { each: true, message: 'Each gallery image must be a valid URL' })
  gallery: string[] = [];
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'MacBook Pro 16"',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'macbook-pro-16',
    pattern: '^[a-z0-9-]+$',
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @ApiProperty({
    description: 'Detailed product description',
    example: 'Powerful laptop for professionals with M2 Pro chip...',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    description: 'Short product summary',
    example: 'Professional laptop with M2 Pro chip',
  })
  @IsString({ message: 'Short description must be a string' })
  @IsNotEmpty({ message: 'Short description is required' })
  shortDescription: string;

  @ApiProperty({
    description: 'Stock Keeping Unit',
    example: 'MBP-16-M2-512',
    pattern: '^[A-Z0-9][A-Z0-9\\-_]*[A-Z0-9]$',
  })
  @IsString({ message: 'SKU must be a string' })
  @IsNotEmpty({ message: 'SKU is required' })
  @Matches(/^[A-Z0-9][A-Z0-9\-_]*[A-Z0-9]$/, {
    message:
      'SKU must contain only alphanumeric characters, hyphens, and underscores',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  sku: string;

  @ApiProperty({
    description: 'Product price',
    example: 89900,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be positive' })
  price: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'THB',
    default: 'THB',
    enum: ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'SGD'],
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter ISO code' })
  currency: string = 'THB';

  @ApiPropertyOptional({
    description: 'Sale price (if on sale)',
    example: 79900,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Sale price must be a number' })
  @Min(0, { message: 'Sale price must be positive' })
  salePrice?: number;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 5,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stock quantity must be a number' })
  @Min(0, { message: 'Stock quantity cannot be negative' })
  stockQuantity: number = 0;

  @ApiPropertyOptional({
    description: 'Whether to manage stock for this product',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Manage stock must be a boolean' })
  manageStock: boolean = true;

  @ApiPropertyOptional({
    description: 'Product weight',
    type: WeightDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WeightDto)
  weight?: WeightDto;

  @ApiPropertyOptional({
    description: 'Product dimensions',
    type: DimensionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({
    description: 'Product attributes (color, size, etc.)',
    example: {
      color: ['Red', 'Blue'],
      size: ['S', 'M', 'L'],
      material: 'Cotton',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Attributes must be an object' })
  attributes?: { [key: string]: string | string[] };

  @ApiPropertyOptional({
    description: 'Category IDs',
    example: ['cat1', 'cat2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Category IDs must be an array' })
  @IsString({ each: true, message: 'Each category ID must be a string' })
  categoryIds: string[] = [];

  @ApiPropertyOptional({
    description: 'Product images',
    type: ProductImagesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductImagesDto)
  images?: ProductImagesDto;
}
