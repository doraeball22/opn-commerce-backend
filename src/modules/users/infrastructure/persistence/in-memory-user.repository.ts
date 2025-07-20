import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';

@Injectable()
export class InMemoryUserRepository extends UserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    super();
    this.initializeWithMockData();
  }

  private initializeWithMockData(): void {
    // Mock data for testing - using fake tokens
    const user1 = User.create(
      'user1',
      'john.doe@example.com',
      'password123', // Will be hashed by the Password value object
      'John Doe',
      new Date('1990-01-15'),
      'MALE',
      true,
    );

    const user2 = User.create(
      'user2',
      'jane.smith@example.com',
      'password456', // Will be hashed by the Password value object
      'Jane Smith',
      new Date('1985-05-20'),
      'FEMALE',
      false,
    );

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const emailVO = new Email(email);

    for (const user of this.users.values()) {
      if (user.email.equals(emailVO)) {
        return user;
      }
    }

    return null;
  }

  async update(user: User): Promise<void> {
    if (!this.users.has(user.id)) {
      throw new Error('User not found');
    }
    this.users.set(user.id, user);
  }

  async delete(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.delete();
    await this.update(user);
  }

  async exists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  // Helper method for authentication mock
  async findByToken(token: string): Promise<User | null> {
    // This is a mock implementation for authentication
    // Maps tokens to user IDs
    const tokenUserMap: Record<string, string> = {
      faketoken_user1: 'user1',
      faketoken_user2: 'user2',
    };

    const userId = tokenUserMap[token];
    if (!userId) {
      return null;
    }

    return this.findById(userId);
  }
}
