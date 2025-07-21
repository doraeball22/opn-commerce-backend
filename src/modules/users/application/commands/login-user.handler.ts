import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { LoginUserCommand } from './login-user.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { JwtAuthService } from '../../../../shared/auth';
import { LoginResponseDto } from '../dto/login.dto';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResponseDto> {
    const { email, password } = command;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = user.password.compareWith(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is deleted
    if (user.isDeleted()) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // Generate JWT token
    const { accessToken, expiresIn } = await this.jwtAuthService.generateToken(
      user.id,
      user.email.value,
      user.name,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
      },
    };
  }
}
