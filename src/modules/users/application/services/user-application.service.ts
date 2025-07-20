import { Injectable, Logger } from '@nestjs/common';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../use-cases/update-user-profile.use-case';
import { ChangeUserPasswordUseCase } from '../use-cases/change-user-password.use-case';
import { DeleteUserAccountUseCase } from '../use-cases/delete-user-account.use-case';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserProfileDto } from '../dto/user-profile.dto';

/**
 * Application Service that orchestrates user-related operations
 * Acts as a facade for use cases and provides additional cross-cutting concerns
 */
@Injectable()
export class UserApplicationService {
  private readonly logger = new Logger(UserApplicationService.name);

  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly changeUserPasswordUseCase: ChangeUserPasswordUseCase,
    private readonly deleteUserAccountUseCase: DeleteUserAccountUseCase,
  ) {}

  /**
   * Register a new user account
   */
  async registerUser(dto: RegisterUserDto): Promise<{ message: string }> {
    this.logger.log(`Registering new user with email: ${dto.email}`);

    try {
      await this.registerUserUseCase.execute(dto);
      this.logger.log(`User registered successfully: ${dto.email}`);

      return { message: 'User registered successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to register user ${dto.email}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    this.logger.log(`Retrieving profile for user: ${userId}`);

    try {
      const profile = await this.getUserProfileUseCase.execute(userId);
      this.logger.log(`Profile retrieved successfully for user: ${userId}`);

      return profile;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve profile for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<{ message: string }> {
    this.logger.log(`Updating profile for user: ${userId}`);

    try {
      await this.updateUserProfileUseCase.execute(userId, dto);
      this.logger.log(`Profile updated successfully for user: ${userId}`);

      return { message: 'Profile updated successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to update profile for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changeUserPassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(`Changing password for user: ${userId}`);

    try {
      await this.changeUserPasswordUseCase.execute(userId, dto);
      this.logger.log(`Password changed successfully for user: ${userId}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to change password for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Delete user account (GDPR compliance)
   */
  async deleteUserAccount(userId: string): Promise<void> {
    this.logger.log(`Deleting account for user: ${userId}`);

    try {
      await this.deleteUserAccountUseCase.execute(userId);
      this.logger.log(`Account deleted successfully for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete account for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
}
