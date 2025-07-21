import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateProductCommand } from '../commands/update-product.command';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';
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
@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    // Find existing product
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new NotFoundException(
        `Product with ID '${command.productId}' not found`,
      );
    }

    if (product.isDeleted()) {
      throw new BadRequestException('Cannot update deleted product');
    }

    // Update basic info if provided
    if (
      command.name !== undefined ||
      command.description !== undefined ||
      command.shortDescription !== undefined
    ) {
      product.updateBasicInfo(
        command.name ?? product.name,
        command.description ?? product.description,
        command.shortDescription ?? product.shortDescription,
      );
    }

    // Update price if provided
    if (command.price !== undefined) {
      const currency = command.currency ?? product.price.getCurrency();
      const newPrice = Money.create(command.price, currency);
      const newSalePrice = command.salePrice
        ? Money.create(command.salePrice, currency)
        : undefined;
      product.updatePrice(newPrice, newSalePrice);
    } else if (command.salePrice !== undefined) {
      const currency = command.currency ?? product.price.getCurrency();
      const newSalePrice = command.salePrice
        ? Money.create(command.salePrice, currency)
        : undefined;
      product.updatePrice(product.price, newSalePrice);
    }

    // Update stock if provided
    if (command.stockQuantity !== undefined) {
      product.updateStock(command.stockQuantity);
    }

    // Update manage stock flag if provided
    if (command.manageStock !== undefined) {
      // This would require adding a method to Product entity
      // For now, we'll skip this update
    }

    // Update weight if provided
    if (command.weight) {
      const weight = ProductWeight.create(
        command.weight.value,
        command.weight.unit as WeightUnit,
      );
      product.updateWeight(weight);
    }

    // Update dimensions if provided
    if (command.dimensions) {
      const dimensions = ProductDimensions.create(
        command.dimensions.length,
        command.dimensions.width,
        command.dimensions.height,
        command.dimensions.unit as DimensionUnit,
      );
      product.updateDimensions(dimensions);
    }

    // Update attributes if provided
    if (command.attributes) {
      product.updateAttributes(command.attributes);
    }

    // Update categories if provided
    if (command.categoryIds) {
      // Validate categories exist
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
      product.assignToCategories(command.categoryIds);
    }

    // Update images if provided
    if (command.images) {
      product.updateImages(command.images);
    }

    // Save updated product
    return this.productRepository.save(product);
  }
}
