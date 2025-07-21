import { User } from '../../domain/entities/user.entity';
import { UserAddress } from '../../domain/entities/user-address.entity';

/**
 * Database adapter interface that abstracts the data storage layer.
 * This allows easy switching between different database implementations
 * (in-memory, PostgreSQL, MongoDB, etc.) without changing business logic.
 */
export interface DatabaseAdapter {
  // User operations
  saveUser(user: User): Promise<User>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>; // Soft delete
  permanentlyDeleteUser(id: string): Promise<void>; // Hard delete

  // User Address operations
  saveUserAddress(address: UserAddress): Promise<UserAddress>;
  findUserAddressById(id: string): Promise<UserAddress | null>;
  findUserAddressesByUserId(userId: string): Promise<UserAddress[]>;
  findUserAddressesByUserIdAndType(
    userId: string,
    type: string,
  ): Promise<UserAddress[]>;
  findDefaultUserAddressByUserId(userId: string): Promise<UserAddress | null>;
  updateUserAddress(address: UserAddress): Promise<UserAddress>;
  deleteUserAddress(id: string): Promise<void>;
  setUserAddressAsDefault(id: string, userId: string): Promise<void>;
  unsetUserAddressDefaults(userId: string): Promise<void>;
  countUserAddressesByUserId(userId: string): Promise<number>;

  // Connection management
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
  isConnected?(): boolean;

  // Transaction support (optional)
  beginTransaction?(): Promise<any>;
  commitTransaction?(transaction: any): Promise<void>;
  rollbackTransaction?(transaction: any): Promise<void>;

  // Health check
  healthCheck?(): Promise<boolean>;
}
