import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import { UserRepository } from '../../domain/repositories/user.repository';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler
  implements ICommandHandler<DeleteUserCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { userId } = command;

    // Delete user (soft delete)
    await this.userRepository.delete(userId);
  }
}
