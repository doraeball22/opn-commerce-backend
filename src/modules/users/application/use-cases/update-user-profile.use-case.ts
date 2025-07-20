import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/update-user.command';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<void> {
    const command = new UpdateUserCommand(
      userId,
      dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      dto.gender,
      dto.subscribedToNewsletter,
    );

    await this.commandBus.execute(command);
  }
}
