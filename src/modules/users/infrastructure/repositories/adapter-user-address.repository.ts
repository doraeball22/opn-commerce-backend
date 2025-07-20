import { Injectable, Inject } from '@nestjs/common';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';
import { UserAddress } from '../../domain/entities/user-address.entity';
import { DatabaseAdapter } from '../adapters/database.adapter';

/**
 * User address repository implementation using the database adapter pattern.
 * This repository delegates all database operations to the configured adapter,
 * allowing seamless switching between different database implementations.
 */
@Injectable()
export class AdapterUserAddressRepository implements UserAddressRepository {
  constructor(
    @Inject('DatabaseAdapter')
    private readonly databaseAdapter: DatabaseAdapter
  ) {}

  async save(userAddress: UserAddress): Promise<UserAddress> {
    return await this.databaseAdapter.saveUserAddress(userAddress);
  }

  async findById(id: string): Promise<UserAddress | null> {
    return await this.databaseAdapter.findUserAddressById(id);
  }

  async findByUserId(userId: string): Promise<UserAddress[]> {
    return await this.databaseAdapter.findUserAddressesByUserId(userId);
  }

  async findByUserIdAndType(
    userId: string,
    type: string,
  ): Promise<UserAddress[]> {
    return await this.databaseAdapter.findUserAddressesByUserIdAndType(
      userId,
      type,
    );
  }

  async findDefaultByUserId(userId: string): Promise<UserAddress | null> {
    return await this.databaseAdapter.findDefaultUserAddressByUserId(userId);
  }

  async update(userAddress: UserAddress): Promise<UserAddress> {
    return await this.databaseAdapter.updateUserAddress(userAddress);
  }

  async delete(id: string): Promise<void> {
    await this.databaseAdapter.deleteUserAddress(id);
  }

  async setAsDefault(id: string, userId: string): Promise<void> {
    await this.databaseAdapter.setUserAddressAsDefault(id, userId);
  }

  async unsetDefault(userId: string): Promise<void> {
    await this.databaseAdapter.unsetUserAddressDefaults(userId);
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.databaseAdapter.countUserAddressesByUserId(userId);
  }
}
