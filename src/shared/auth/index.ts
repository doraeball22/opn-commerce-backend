/**
 * Shared Authentication Module Exports
 * 
 * This file provides a clean import interface for all authentication-related
 * functionality that can be used across different modules.
 * 
 * Usage in feature modules:
 * 
 * import { 
 *   JwtAuthGuard, 
 *   CurrentUser, 
 *   ICurrentUser,
 *   JwtAuthService 
 * } from '@/shared/auth';
 */

// Core module
export { AuthModule } from './auth.module';

// Services
export { JwtAuthService } from './services/jwt-auth.service';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';

// Decorators
export { CurrentUser } from './decorators/current-user.decorator';

// Interfaces & Types
export type { 
  ICurrentUser, 
  JwtPayload 
} from './interfaces/current-user.interface';