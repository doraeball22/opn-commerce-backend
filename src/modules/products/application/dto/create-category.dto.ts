import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'electronics',
    pattern: '^[a-z0-9-]+$',
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronic devices and gadgets',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID for creating subcategories',
    example: 'parent-category-id',
  })
  @IsOptional()
  @IsString({ message: 'Parent ID must be a string' })
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/category-image.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Sort order for category display',
    example: 10,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0, { message: 'Sort order cannot be negative' })
  sortOrder: number = 0;
}
