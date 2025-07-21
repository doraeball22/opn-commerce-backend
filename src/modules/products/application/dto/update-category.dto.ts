import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
  Min,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Electronics & Gadgets',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'electronics-gadgets',
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronic devices, gadgets and accessories',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID for moving category',
    example: 'parent-category-id',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Parent ID must be a string' })
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/updated-category-image.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether category is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for category display',
    example: 15,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0, { message: 'Sort order cannot be negative' })
  sortOrder?: number;
}
