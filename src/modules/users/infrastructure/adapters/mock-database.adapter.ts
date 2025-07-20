import { Injectable } from '@nestjs/common';
import { DatabaseAdapter } from './database.adapter';
import { User } from '../../domain/entities/user.entity';
import { UserAddress } from '../../domain/entities/user-address.entity';

/**
 * Mock database adapter implementation using in-memory storage.
 * Perfect for development, testing, and rapid prototyping.
 */
@Injectable()
export class MockDatabaseAdapter implements DatabaseAdapter {
  private users: Map<string, User> = new Map();
  private userAddresses: Map<string, UserAddress> = new Map();
  private connected: boolean = false;

  // Connection management
  async connect(): Promise<void> {
    this.connected = true;
    console.log('🔗 Mock Database: Connected');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.users.clear();
    this.userAddresses.clear();
    console.log('🔌 Mock Database: Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async healthCheck(): Promise<boolean> {
    return this.connected;
  }

  // User operations
  async saveUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user && !user.isDeleted() ? user : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    const user = users.find((u) => u.email.value === email && !u.isDeleted());
    return user || null;
  }

  async updateUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.delete();
      this.users.set(id, user);
    }
  }

  // User Address operations
  async saveUserAddress(address: UserAddress): Promise<UserAddress> {
    this.userAddresses.set(address.id, address);
    return address;
  }

  async findUserAddressById(id: string): Promise<UserAddress | null> {
    const address = this.userAddresses.get(id);
    return address && !address.isDeleted() ? address : null;
  }

  async findUserAddressesByUserId(userId: string): Promise<UserAddress[]> {
    const addresses = Array.from(this.userAddresses.values())
      .filter((address) => address.userId === userId && !address.isDeleted())
      .sort((a, b) => {
        // Default addresses first, then by creation date
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return addresses;
  }

  async findUserAddressesByUserIdAndType(
    userId: string,
    type: string,
  ): Promise<UserAddress[]> {
    return Array.from(this.userAddresses.values()).filter(
      (address) =>
        address.userId === userId &&
        address.type === type &&
        !address.isDeleted(),
    );
  }

  async findDefaultUserAddressByUserId(
    userId: string,
  ): Promise<UserAddress | null> {
    const addresses = Array.from(this.userAddresses.values());
    const defaultAddress = addresses.find(
      (address) =>
        address.userId === userId && address.isDefault && !address.isDeleted(),
    );
    return defaultAddress || null;
  }

  async updateUserAddress(address: UserAddress): Promise<UserAddress> {
    this.userAddresses.set(address.id, address);
    return address;
  }

  async deleteUserAddress(id: string): Promise<void> {
    const address = this.userAddresses.get(id);
    if (address) {
      address.delete();
      this.userAddresses.set(id, address);
    }
  }

  async setUserAddressAsDefault(id: string, userId: string): Promise<void> {
    // First unset all defaults for this user
    await this.unsetUserAddressDefaults(userId);

    // Then set the specified address as default
    const address = this.userAddresses.get(id);
    if (address && address.userId === userId && !address.isDeleted()) {
      address.setAsDefault();
      this.userAddresses.set(id, address);
    }
  }

  async unsetUserAddressDefaults(userId: string): Promise<void> {
    const addresses = Array.from(this.userAddresses.values());
    addresses
      .filter((address) => address.userId === userId && address.isDefault)
      .forEach((address) => {
        address.unsetAsDefault();
        this.userAddresses.set(address.id, address);
      });
  }

  async countUserAddressesByUserId(userId: string): Promise<number> {
    return Array.from(this.userAddresses.values()).filter(
      (address) => address.userId === userId && !address.isDeleted(),
    ).length;
  }

  // Helper methods for testing and development
  clearAll(): void {
    this.users.clear();
    this.userAddresses.clear();
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getAllUserAddresses(): UserAddress[] {
    return Array.from(this.userAddresses.values());
  }

  getStats(): {
    users: number;
    addresses: number;
    activeUsers: number;
    activeAddresses: number;
  } {
    const allUsers = Array.from(this.users.values());
    const allAddresses = Array.from(this.userAddresses.values());

    return {
      users: allUsers.length,
      addresses: allAddresses.length,
      activeUsers: allUsers.filter((u) => !u.isDeleted()).length,
      activeAddresses: allAddresses.filter((a) => !a.isDeleted()).length,
    };
  }
}
