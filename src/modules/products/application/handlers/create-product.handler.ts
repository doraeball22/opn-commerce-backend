import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductCommand } from '../commands/create-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { ProductSku } from '../../domain/value-objects/product-sku.vo';
import { Money } from '../../domain/value-objects/money.vo';
import {
  ProductWeight,
  WeightUnit,
} from '../../domain/value-objects/product-weight.vo';
import {
  ProductDimensions,
  DimensionUnit,
} from '../../domain/value-objects/product-dimensions.vo';

@Injectable()
@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    // Validate SKU uniqueness
    const sku = ProductSku.create(command.sku);
    const existingProduct = await this.productRepository.findBySku(sku);
    if (existingProduct) {
      throw new ConflictException(
        `Product with SKU '${command.sku}' already exists`,
      );
    }

    // Validate slug uniqueness
    const existingBySlug = await this.productRepository.findBySlug(
      command.slug,
    );
    if (existingBySlug) {
      throw new ConflictException(
        `Product with slug '${command.slug}' already exists`,
      );
    }

    // Validate categories exist
    if (command.categoryIds && command.categoryIds.length > 0) {
      for (const categoryId of command.categoryIds) {
        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
          throw new BadRequestException(
            `Category with ID '${categoryId}' not found`,
          );
        }
        if (category.isDeleted()) {
          throw new BadRequestException(
            `Category with ID '${categoryId}' is deleted`,
          );
        }
      }
    }

    // Create price
    const price = Money.create(command.price, command.currency);
    const salePrice = command.salePrice
      ? Money.create(command.salePrice, command.currency)
      : undefined;

    // Create product
    const product = Product.create(
      command.name,
      command.slug,
      command.description,
      command.shortDescription,
      sku,
      price,
      command.stockQuantity,
      command.manageStock,
    );

    // Set sale price if provided
    if (salePrice) {
      product.updatePrice(price, salePrice);
    }

    // Set weight if provided
    if (command.weight) {
      const weight = ProductWeight.create(
        command.weight.value,
        command.weight.unit as WeightUnit,
      );
      product.updateWeight(weight);
    }

    // Set dimensions if provided
    if (command.dimensions) {
      const dimensions = ProductDimensions.create(
        command.dimensions.length,
        command.dimensions.width,
        command.dimensions.height,
        command.dimensions.unit as DimensionUnit,
      );
      product.updateDimensions(dimensions);
    }

    // Set attributes if provided
    if (command.attributes) {
      product.updateAttributes(command.attributes);
    }

    // Assign to categories
    if (command.categoryIds && command.categoryIds.length > 0) {
      product.assignToCategories(command.categoryIds);
    }

    // Set images if provided
    if (command.images) {
      product.updateImages(command.images);
    }

    // Save product
    return this.productRepository.save(product);
  }
}
