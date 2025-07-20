import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { DatabaseAdapter } from '../adapters/database.adapter';

/**
 * User repository implementation using the database adapter pattern.
 * This repository delegates all database operations to the configured adapter,
 * allowing seamless switching between different database implementations.
 */
@Injectable()
export class AdapterUserRepository implements UserRepository {
  constructor(
    @Inject('DatabaseAdapter')
    private readonly databaseAdapter: DatabaseAdapter,
  ) {}

  async save(user: User): Promise<void> {
    await this.databaseAdapter.saveUser(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.databaseAdapter.findUserById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.databaseAdapter.findUserByEmail(email);
  }

  async update(user: User): Promise<void> {
    await this.databaseAdapter.updateUser(user);
  }

  async delete(id: string): Promise<void> {
    await this.databaseAdapter.deleteUser(id);
  }

  async exists(email: string): Promise<boolean> {
    const user = await this.databaseAdapter.findUserByEmail(email);
    return !!user;
  }
}
