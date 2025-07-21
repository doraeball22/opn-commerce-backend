import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DeleteProductCommand } from '../commands/delete-product.command';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler
  implements ICommandHandler<DeleteProductCommand>
{
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    // Check if product exists
    const productExists = await this.productRepository.exists(
      command.productId,
    );
    if (!productExists) {
      throw new NotFoundException(
        `Product with ID '${command.productId}' not found`,
      );
    }

    if (command.permanent) {
      // Permanently delete the product
      await this.productRepository.permanentlyDelete(command.productId);
    } else {
      // Soft delete the product
      await this.productRepository.delete(command.productId);
    }
  }
}
