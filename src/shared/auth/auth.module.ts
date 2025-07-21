import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthService } from './services/jwt-auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Global Authentication Module
 *
 * This module provides JWT authentication services that can be used across
 * all feature modules (users, orders, cart, products, etc.).
 *
 * The @Global() decorator makes this module available throughout the application
 * without needing to import it in every feature module.
 *
 * Exports:
 * - JwtAuthService: For token generation and verification
 * - JwtAuthGuard: For protecting routes with JWT authentication
 * - CurrentUser decorator: For extracting user info from requests (via index.ts)
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
    }),
  ],
  providers: [JwtAuthService, JwtAuthGuard],
  exports: [
    JwtAuthService,
    JwtAuthGuard,
    JwtModule, // Export JwtModule so other modules can use JwtService directly if needed
  ],
})
export class AuthModule {}
