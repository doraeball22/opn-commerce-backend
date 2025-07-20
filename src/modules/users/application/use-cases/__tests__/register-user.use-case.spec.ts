import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserUseCase } from '../register-user.use-case';
import { RegisterUserCommand } from '../../commands/register-user.command';
import { RegisterUserDto } from '../../dto/register-user.dto';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    commandBus = module.get(CommandBus);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should execute RegisterUserCommand with correct parameters', async () => {
      const dto: RegisterUserDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        gender: 'MALE',
        address: {
          street: '123 Main St',
          city: 'Bangkok',
          state: 'Bangkok',
          postalCode: '10110',
          country: 'Thailand',
        },
        subscribedToNewsletter: true,
      };

      await useCase.execute(dto);

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(RegisterUserCommand),
      );

      const command = commandBus.execute.mock
        .calls[0][0] as RegisterUserCommand;
      expect(command.email).toBe(dto.email);
      expect(command.password).toBe(dto.password);
      expect(command.name).toBe(dto.name);
      expect(command.dateOfBirth).toEqual(new Date(dto.dateOfBirth));
      expect(command.gender).toBe(dto.gender);
      expect(command.address).toBe(dto.address);
      expect(command.subscribedToNewsletter).toBe(dto.subscribedToNewsletter);
    });

    it('should handle command bus errors', async () => {
      const dto: RegisterUserDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        gender: 'MALE',
        address: {
          street: '123 Main St',
          city: 'Bangkok',
          state: 'Bangkok',
          postalCode: '10110',
          country: 'Thailand',
        },
        subscribedToNewsletter: true,
      };

      const error = new Error('Command execution failed');
      commandBus.execute.mockRejectedValue(error);

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Command execution failed',
      );
    });
  });
});
