import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChangePasswordCommand } from './change-password.command';
import { UserRepository } from '../../domain/repositories/user.repository';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { userId, currentPassword, newPassword } = command;

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Change password
    user.changePassword(currentPassword, newPassword);

    // Save updated user
    await this.userRepository.update(user);
  }
}
