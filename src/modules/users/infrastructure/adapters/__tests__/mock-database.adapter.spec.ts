import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MockDatabaseAdapter } from '../mock-database.adapter';
import { User } from '../../../domain/entities/user.entity';
import {
  UserAddress,
  AddressType,
} from '../../../domain/entities/user-address.entity';
import { Address } from '../../../domain/value-objects/address.vo';
import { Location } from '../../../domain/value-objects/location.vo';

describe('MockDatabaseAdapter', () => {
  let adapter: MockDatabaseAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockDatabaseAdapter,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock'),
          },
        },
      ],
    }).compile();

    adapter = module.get<MockDatabaseAdapter>(MockDatabaseAdapter);
    await adapter.connect();
  });

  afterEach(async () => {
    await adapter.disconnect();
  });

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);
    });

    it('should disconnect successfully', async () => {
      await adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });

    it('should pass health check when connected', async () => {
      await adapter.connect();
      const isHealthy = await adapter.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should fail health check when disconnected', async () => {
      await adapter.disconnect();
      const isHealthy = await adapter.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('User Operations', () => {
    const validUser = User.create(
      'user-123',
      'test@example.com',
      'password123',
      'Test User',
      new Date('1990-01-15'),
      'MALE',
      true,
    );

    it('should save and retrieve user', async () => {
      const savedUser = await adapter.saveUser(validUser);
      expect(savedUser.id).toBe(validUser.id);

      const foundUser = await adapter.findUserById(validUser.id);
      expect(foundUser).toBeTruthy();
      expect(foundUser!.id).toBe(validUser.id);
    });

    it('should find user by email', async () => {
      await adapter.saveUser(validUser);

      const foundUser = await adapter.findUserByEmail('test@example.com');
      expect(foundUser).toBeTruthy();
      expect(foundUser!.email.value).toBe('test@example.com');
    });

    it('should update user', async () => {
      await adapter.saveUser(validUser);

      const updatedUser = await adapter.updateUser(validUser);
      expect(updatedUser.id).toBe(validUser.id);
    });

    it('should soft delete user', async () => {
      await adapter.saveUser(validUser);

      await adapter.deleteUser(validUser.id);

      const foundUser = await adapter.findUserById(validUser.id);
      expect(foundUser).toBeNull(); // Should not find deleted user
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await adapter.findUserById('non-existent');
      expect(foundUser).toBeNull();
    });
  });

  describe('User Address Operations', () => {
    const userId = 'user-123';
    const addressVO = new Address(
      '123 Main St',
      'Bangkok',
      'Bangkok',
      '10110',
      'Thailand',
    );
    const location = new Location(13.7563, 100.5018);

    const validAddress = UserAddress.create(
      'address-123',
      userId,
      addressVO,
      AddressType.HOME,
      'Home Address',
      true,
      location,
      'Ring doorbell twice',
    );

    it('should save and retrieve user address', async () => {
      const savedAddress = await adapter.saveUserAddress(validAddress);
      expect(savedAddress.id).toBe(validAddress.id);

      const foundAddress = await adapter.findUserAddressById(validAddress.id);
      expect(foundAddress).toBeTruthy();
      expect(foundAddress!.id).toBe(validAddress.id);
    });

    it('should find addresses by user ID', async () => {
      await adapter.saveUserAddress(validAddress);

      const addresses = await adapter.findUserAddressesByUserId(userId);
      expect(addresses).toHaveLength(1);
      expect(addresses[0].id).toBe(validAddress.id);
    });

    it('should find addresses by user ID and type', async () => {
      await adapter.saveUserAddress(validAddress);

      const addresses = await adapter.findUserAddressesByUserIdAndType(
        userId,
        AddressType.HOME,
      );
      expect(addresses).toHaveLength(1);
      expect(addresses[0].type).toBe(AddressType.HOME);
    });

    it('should find default address by user ID', async () => {
      await adapter.saveUserAddress(validAddress);

      const defaultAddress =
        await adapter.findDefaultUserAddressByUserId(userId);
      expect(defaultAddress).toBeTruthy();
      expect(defaultAddress!.isDefault).toBe(true);
    });

    it('should update user address', async () => {
      await adapter.saveUserAddress(validAddress);

      const updatedAddress = await adapter.updateUserAddress(validAddress);
      expect(updatedAddress.id).toBe(validAddress.id);
    });

    it('should set address as default', async () => {
      await adapter.saveUserAddress(validAddress);

      await adapter.setUserAddressAsDefault(validAddress.id, userId);

      const foundAddress = await adapter.findUserAddressById(validAddress.id);
      expect(foundAddress!.isDefault).toBe(true);
    });

    it('should unset default addresses', async () => {
      await adapter.saveUserAddress(validAddress);

      await adapter.unsetUserAddressDefaults(userId);

      const foundAddress = await adapter.findUserAddressById(validAddress.id);
      expect(foundAddress!.isDefault).toBe(false);
    });

    it('should count addresses by user ID', async () => {
      await adapter.saveUserAddress(validAddress);

      const count = await adapter.countUserAddressesByUserId(userId);
      expect(count).toBe(1);
    });

    it('should soft delete address', async () => {
      await adapter.saveUserAddress(validAddress);

      await adapter.deleteUserAddress(validAddress.id);

      const foundAddress = await adapter.findUserAddressById(validAddress.id);
      expect(foundAddress).toBeNull(); // Should not find deleted address
    });
  });

  describe('Helper Methods', () => {
    it('should clear all data', () => {
      adapter.clearAll();

      const users = adapter.getAllUsers();
      const addresses = adapter.getAllUserAddresses();

      expect(users).toHaveLength(0);
      expect(addresses).toHaveLength(0);
    });

    it('should return correct stats', async () => {
      const user = User.create(
        'user-1',
        'test@example.com',
        'password',
        'Test',
        new Date(),
        'MALE',
        true,
      );
      await adapter.saveUser(user);

      const stats = adapter.getStats();
      expect(stats.users).toBe(1);
      expect(stats.activeUsers).toBe(1);
    });
  });
});
