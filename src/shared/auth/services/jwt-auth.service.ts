import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/current-user.interface';

/**
 * JWT Authentication Service
 *
 * Handles JWT token generation, verification, and validation.
 * This service is shared across all modules that need JWT functionality.
 */
@Injectable()
export class JwtAuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    this.jwtExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') || '24h';
  }

  /**
   * Generate a JWT token for a user
   *
   * @param userId - Unique user identifier
   * @param email - User's email address
   * @param name - User's display name
   * @returns Object containing access token and expiration info
   */
  async generateToken(
    userId: string,
    email: string,
    name: string,
  ): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
    });

    return {
      accessToken,
      expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
    };
  }

  /**
   * Verify and decode a JWT token
   *
   * @param token - JWT token to verify
   * @returns Decoded JWT payload
   * @throws Error if token is invalid or expired
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode a JWT token without verification (use with caution)
   *
   * @param token - JWT token to decode
   * @returns Decoded payload or null if invalid
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Parse expiration time string to seconds
   *
   * @param expiresIn - Expiration string (e.g., '24h', '7d', '60s')
   * @returns Expiration time in seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 24 * 60 * 60; // Default to 24 hours
    }
  }
}
