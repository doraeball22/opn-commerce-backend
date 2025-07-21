import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthService } from '../services/jwt-auth.service';
import { JwtPayload } from '../interfaces/current-user.interface';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * JWT Authentication Guard
 *
 * This guard validates JWT tokens and attaches the user information to the request.
 * Use this guard on any controller or route that requires authentication.
 *
 * Usage:
 *
 * 1. Controller-level protection:
 *    @Controller('orders')
 *    @UseGuards(JwtAuthGuard)
 *    export class OrdersController { ... }
 *
 * 2. Route-level protection:
 *    @Get('profile')
 *    @UseGuards(JwtAuthGuard)
 *    async getProfile(@CurrentUser() user: ICurrentUser) { ... }
 *
 * The guard expects the Authorization header to contain a Bearer token:
 * Authorization: Bearer <jwt-token>
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    try {
      const payload = await this.jwtAuthService.verifyToken(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
