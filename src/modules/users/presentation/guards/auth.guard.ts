import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    // Mock token validation - replace with real JWT validation
    const tokenUserMap: Record<string, string> = {
      'faketoken_user1': 'user1',
      'faketoken_user2': 'user2',
      'mock-valid-token': 'user1', // For compatibility with BearerTokenGuard
    };

    const userId = tokenUserMap[token];
    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isDeleted()) {
      throw new UnauthorizedException('User account has been deleted');
    }

    // Attach user to request
    request.user = user;
    return true;
  }
}
