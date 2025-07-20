import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../commands/delete-user.command';

@Injectable()
export class DeleteUserAccountUseCase {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(userId: string): Promise<void> {
    const command = new DeleteUserCommand(userId);
    await this.commandBus.execute(command);
  }
}
