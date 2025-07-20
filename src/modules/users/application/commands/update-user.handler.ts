import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Gender } from '../../domain/value-objects/gender.vo';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler
  implements ICommandHandler<UpdateUserCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const { userId, dateOfBirth, gender, subscribedToNewsletter } = command;

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prepare value objects
    let genderVO: Gender | undefined;

    if (gender) {
      genderVO = new Gender(gender);
    }

    // Update user
    user.updateProfile(dateOfBirth, genderVO, subscribedToNewsletter);

    // Save updated user
    await this.userRepository.update(user);
  }
}
