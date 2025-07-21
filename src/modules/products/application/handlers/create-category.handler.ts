import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCategoryCommand } from '../commands/create-category.command';
import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable()
@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    // Validate slug uniqueness
    const existingBySlug = await this.categoryRepository.findBySlug(
      command.slug,
    );
    if (existingBySlug) {
      throw new ConflictException(
        `Category with slug '${command.slug}' already exists`,
      );
    }

    // Validate parent category exists if provided
    if (command.parentId) {
      const parentCategory = await this.categoryRepository.findById(
        command.parentId,
      );
      if (!parentCategory) {
        throw new BadRequestException(
          `Parent category with ID '${command.parentId}' not found`,
        );
      }
      if (parentCategory.isDeleted()) {
        throw new BadRequestException(
          `Parent category with ID '${command.parentId}' is deleted`,
        );
      }
    }

    // Create category
    const category = Category.create(
      command.name,
      command.slug,
      command.description,
      command.parentId,
    );

    // Set image if provided
    if (command.imageUrl) {
      category.setImage(command.imageUrl);
    }

    // Set sort order
    category.setSortOrder(command.sortOrder);

    // Save category
    return this.categoryRepository.save(category);
  }
}
