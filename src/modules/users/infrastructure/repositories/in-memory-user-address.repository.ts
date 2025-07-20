import { Injectable } from '@nestjs/common';
import {
  UserAddress,
  AddressType,
} from '../../domain/entities/user-address.entity';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';

@Injectable()
export class InMemoryUserAddressRepository implements UserAddressRepository {
  private addresses: Map<string, UserAddress> = new Map();

  async save(userAddress: UserAddress): Promise<UserAddress> {
    this.addresses.set(userAddress.id, userAddress);
    return userAddress;
  }

  async findById(id: string): Promise<UserAddress | null> {
    const address = this.addresses.get(id);
    return address && !address.isDeleted() ? address : null;
  }

  async findByUserId(userId: string): Promise<UserAddress[]> {
    return Array.from(this.addresses.values())
      .filter((address) => address.userId === userId && !address.isDeleted())
      .sort((a, b) => {
        // Default addresses first, then by creation date
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async findByUserIdAndType(
    userId: string,
    type: string,
  ): Promise<UserAddress[]> {
    return Array.from(this.addresses.values()).filter(
      (address) =>
        address.userId === userId &&
        address.type === type &&
        !address.isDeleted(),
    );
  }

  async findDefaultByUserId(userId: string): Promise<UserAddress | null> {
    const addresses = Array.from(this.addresses.values());
    const defaultAddress = addresses.find(
      (address) =>
        address.userId === userId && address.isDefault && !address.isDeleted(),
    );
    return defaultAddress || null;
  }

  async update(userAddress: UserAddress): Promise<UserAddress> {
    this.addresses.set(userAddress.id, userAddress);
    return userAddress;
  }

  async delete(id: string): Promise<void> {
    const address = this.addresses.get(id);
    if (address) {
      address.delete();
      this.addresses.set(id, address);
    }
  }

  async setAsDefault(id: string, userId: string): Promise<void> {
    // First unset all defaults for this user
    await this.unsetDefault(userId);

    // Then set the specified address as default
    const address = this.addresses.get(id);
    if (address && address.userId === userId && !address.isDeleted()) {
      address.setAsDefault();
      this.addresses.set(id, address);
    }
  }

  async unsetDefault(userId: string): Promise<void> {
    const addresses = Array.from(this.addresses.values());
    addresses
      .filter((address) => address.userId === userId && address.isDefault)
      .forEach((address) => {
        address.unsetAsDefault();
        this.addresses.set(address.id, address);
      });
  }

  async countByUserId(userId: string): Promise<number> {
    return Array.from(this.addresses.values()).filter(
      (address) => address.userId === userId && !address.isDeleted(),
    ).length;
  }

  // Helper methods for testing
  clear(): void {
    this.addresses.clear();
  }

  getAll(): UserAddress[] {
    return Array.from(this.addresses.values());
  }
}
