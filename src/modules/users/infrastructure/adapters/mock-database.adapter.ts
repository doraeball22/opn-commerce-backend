import { Injectable } from '@nestjs/common';
import { DatabaseAdapter } from './database.adapter';
import { User } from '../../domain/entities/user.entity';
import {
  UserAddress,
  AddressType,
} from '../../domain/entities/user-address.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { Gender } from '../../domain/value-objects/gender.vo';
import { Address } from '../../domain/value-objects/address.vo';
import { Location } from '../../domain/value-objects/location.vo';

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
    await this.seedTestData();
    console.log('🔗 Mock Database: Connected with test users seeded');
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

  private async seedTestData(): Promise<void> {
    // Clear existing data first
    this.users.clear();
    this.userAddresses.clear();

    // Create test users with known credentials for easy testing
    const testUsers = [
      {
        id: 'test-user-1',
        email: 'john.doe@example.com',
        password: 'password123', // Plain text - will be hashed
        name: 'John Doe',
        dateOfBirth: new Date('1990-01-15'),
        gender: 'MALE',
        subscribedToNewsletter: true,
      },
      {
        id: 'test-user-2',
        email: 'jane.smith@example.com',
        password: 'password123', // Plain text - will be hashed
        name: 'Jane Smith',
        dateOfBirth: new Date('1992-03-22'),
        gender: 'FEMALE',
        subscribedToNewsletter: false,
      },
      {
        id: 'test-user-3',
        email: 'admin@example.com',
        password: 'admin123', // Plain text - will be hashed
        name: 'Admin User',
        dateOfBirth: new Date('1985-07-10'),
        gender: 'OTHER',
        subscribedToNewsletter: true,
      },
    ];

    // Create and save test users
    for (const userData of testUsers) {
      const user = new User(
        userData.id,
        new Email(userData.email),
        new Password(userData.password), // Will be hashed automatically
        userData.name,
        userData.dateOfBirth,
        new Gender(userData.gender),
        userData.subscribedToNewsletter,
      );
      this.users.set(user.id, user);
    }

    // Create test addresses for the users
    const testAddresses = [
      {
        id: 'addr-1',
        userId: 'test-user-1',
        address: new Address(
          '123 Main Street',
          'Bangkok',
          'Bangkok',
          '10110',
          'Thailand',
        ),
        type: AddressType.HOME,
        label: 'Home Address',
        isDefault: true,
        location: new Location(13.7563, 100.5018),
        deliveryInstructions: 'Ring doorbell twice',
      },
      {
        id: 'addr-2',
        userId: 'test-user-2',
        address: new Address(
          '456 Business District',
          'Bangkok',
          'Bangkok',
          '10500',
          'Thailand',
        ),
        type: AddressType.WORK,
        label: 'Office Address',
        isDefault: true,
        location: new Location(13.7398, 100.5441),
        deliveryInstructions: 'Deliver to reception',
      },
      {
        id: 'addr-3',
        userId: 'test-user-1',
        address: new Address(
          '789 Secondary Road',
          'Bangkok',
          'Bangkok',
          '10120',
          'Thailand',
        ),
        type: AddressType.SHIPPING,
        label: 'Secondary Address',
        isDefault: false,
        location: new Location(13.765, 100.538),
        deliveryInstructions: 'Leave with security guard',
      },
    ];

    // Create and save test addresses
    for (const addrData of testAddresses) {
      const address = UserAddress.create(
        addrData.id,
        addrData.userId,
        addrData.address,
        addrData.type,
        addrData.label,
        addrData.isDefault,
        addrData.location,
        addrData.deliveryInstructions,
      );
      this.userAddresses.set(address.id, address);
    }

    console.log('🌱 Test data seeded successfully:');
    console.log('  📧 john.doe@example.com / password123');
    console.log('  📧 jane.smith@example.com / password123');
    console.log('  📧 admin@example.com / admin123');
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

  async permanentlyDeleteUser(id: string): Promise<void> {
    // Remove user completely from storage
    this.users.delete(id);

    // Also remove all associated addresses
    const userAddresses = Array.from(this.userAddresses.values()).filter(
      (address) => address.userId === id,
    );

    userAddresses.forEach((address) => {
      this.userAddresses.delete(address.id);
    });
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
