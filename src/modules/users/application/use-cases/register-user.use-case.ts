import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../commands/register-user.command';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(dto: RegisterUserDto): Promise<void> {
    const command = new RegisterUserCommand(
      dto.email,
      dto.password,
      dto.name,
      new Date(dto.dateOfBirth),
      dto.gender,
      dto.address,
      dto.subscribedToNewsletter,
    );

    await this.commandBus.execute(command);
  }
}
