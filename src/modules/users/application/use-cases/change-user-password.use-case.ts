import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../commands/change-password.command';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class ChangeUserPasswordUseCase {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const command = new ChangePasswordCommand(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );

    await this.commandBus.execute(command);
  }
}
