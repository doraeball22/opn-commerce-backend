import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateCategoryCommand } from '../commands/update-category.command';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: UpdateCategoryCommand): Promise<Category> {
    const {
      categoryId,
      name,
      slug,
      description,
      parentId,
      imageUrl,
      isActive,
      sortOrder,
    } = command;

    // Find the existing category
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.isDeleted()) {
      throw new NotFoundException('Category not found');
    }

    // Check if slug is unique (if being updated)
    if (slug && slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findBySlug(slug);
      if (existingCategory && existingCategory.id !== categoryId) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    // Validate parent ID if being updated
    if (parentId !== undefined) {
      if (parentId === categoryId) {
        throw new ConflictException('Category cannot be its own parent');
      }

      if (parentId !== null) {
        const parentCategory = await this.categoryRepository.findById(parentId);
        if (!parentCategory || parentCategory.isDeleted()) {
          throw new NotFoundException('Parent category not found');
        }

        // Check for circular reference (would create infinite loop)
        const descendants = await this.categoryRepository.findDescendants(categoryId);
        if (descendants.some(desc => desc.id === parentId)) {
          throw new ConflictException('Cannot move category to its own descendant');
        }
      }
    }

    // Update category properties
    if (name !== undefined || description !== undefined) {
      category.updateBasicInfo(name || category.name, description);
    }

    if (slug !== undefined) {
      category.updateSlug(slug);
    }

    if (parentId !== undefined) {
      category.setParent(parentId);
    }

    if (imageUrl !== undefined) {
      category.setImage(imageUrl);
    }

    if (isActive !== undefined) {
      if (isActive) {
        category.activate();
      } else {
        category.deactivate();
      }
    }

    if (sortOrder !== undefined) {
      category.setSortOrder(sortOrder);
    }

    // Save the updated category
    const updatedCategory = await this.categoryRepository.save(category);

    return updatedCategory;
  }
}