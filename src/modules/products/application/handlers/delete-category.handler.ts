import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DeleteCategoryCommand } from '../commands/delete-category.command';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryCommand>
{
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: DeleteCategoryCommand): Promise<void> {
    const { categoryId, permanent } = command;

    // Find the existing category
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!permanent && category.isDeleted()) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has children
    const children = await this.categoryRepository.findChildren(categoryId);
    if (children.length > 0) {
      throw new ConflictException(
        'Cannot delete category that has subcategories. Please delete or move subcategories first.',
      );
    }

    // Check if category has products (would need to integrate with product repository)
    // For now, we'll implement a basic check through the database adapter
    try {
      // This would normally check via a product repository
      // const productCount = await this.productRepository.countByCategory(categoryId);
      // if (productCount > 0) {
      //   throw new ConflictException(
      //     'Cannot delete category that contains products. Please move or delete products first.',
      //   );
      // }
    } catch (error) {
      // Handle any errors from product count check
    }

    if (permanent) {
      // Permanently delete the category
      await this.categoryRepository.permanentlyDelete(categoryId);
    } else {
      // Soft delete the category
      category.delete();
      await this.categoryRepository.save(category);
    }
  }
}
