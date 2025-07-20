import { UserAddress, AddressType } from '../user-address.entity';
import { Address } from '../../value-objects/address.vo';
import { Location } from '../../value-objects/location.vo';

describe('UserAddress Entity', () => {
  const validAddressData = {
    id: 'address-123',
    userId: 'user-123',
    address: new Address(
      '123 Main St',
      'Bangkok',
      'Bangkok',
      '10110',
      'Thailand',
    ),
    type: AddressType.HOME,
    label: 'Home Address',
    isDefault: true,
  };

  const validLocation = new Location(13.7563, 100.5018);

  describe('create', () => {
    it('should create a user address with valid data', () => {
      const userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        true, // Set as default for this test
      );

      expect(userAddress.id).toBe(validAddressData.id);
      expect(userAddress.userId).toBe(validAddressData.userId);
      expect(userAddress.address).toBe(validAddressData.address);
      expect(userAddress.type).toBe(validAddressData.type);
      expect(userAddress.label).toBe(validAddressData.label);
      expect(userAddress.isDefault).toBe(true);
      expect(userAddress.createdAt).toBeInstanceOf(Date);
      expect(userAddress.updatedAt).toBeInstanceOf(Date);
      expect(userAddress.deletedAt).toBeUndefined();
    });

    it('should create a user address with location and delivery instructions', () => {
      const userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false, // Not default so it can be deleted for tests
        validLocation,
        'Ring doorbell twice',
      );

      expect(userAddress.location).toBe(validLocation);
      expect(userAddress.deliveryInstructions).toBe('Ring doorbell twice');
    });
  });

  describe('setAsDefault', () => {
    it('should set address as default', () => {
      const userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false,
      );

      expect(userAddress.isDefault).toBe(false);

      userAddress.setAsDefault();

      expect(userAddress.isDefault).toBe(true);
    });

    it('should throw error when setting deleted address as default', () => {
      const userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false,
      );

      userAddress.delete();

      expect(() => userAddress.setAsDefault()).toThrow(
        'Cannot set deleted address as default',
      );
    });
  });

  describe('unsetAsDefault', () => {
    it('should unset address as default', () => {
      const userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        true,
      );

      expect(userAddress.isDefault).toBe(true);

      userAddress.unsetAsDefault();

      expect(userAddress.isDefault).toBe(false);
    });
  });

  describe('updateAddress', () => {
    let userAddress: UserAddress;

    beforeEach(() => {
      userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false, // Not default so it can be deleted for tests
      );
    });

    it('should update address successfully', () => {
      const newAddress = new Address(
        '456 Oak Ave',
        'Chiang Mai',
        'Chiang Mai',
        '50200',
        'Thailand',
      );
      const newLocation = new Location(18.7883, 98.9853);

      userAddress.updateAddress(newAddress, newLocation, 'Leave at front door');

      expect(userAddress.address).toBe(newAddress);
      expect(userAddress.location).toBe(newLocation);
      expect(userAddress.deliveryInstructions).toBe('Leave at front door');
    });

    it('should throw error when updating deleted address', () => {
      userAddress.delete();

      const newAddress = new Address(
        '456 Oak Ave',
        'Chiang Mai',
        'Chiang Mai',
        '50200',
        'Thailand',
      );

      expect(() => userAddress.updateAddress(newAddress)).toThrow(
        'Cannot update deleted address',
      );
    });
  });

  describe('updateLabel', () => {
    let userAddress: UserAddress;

    beforeEach(() => {
      userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false, // Not default so it can be deleted for tests
      );
    });

    it('should update label successfully', () => {
      userAddress.updateLabel('Work Address');

      expect(userAddress.label).toBe('Work Address');
    });

    it('should throw error for empty label', () => {
      expect(() => userAddress.updateLabel('')).toThrow(
        'Address label cannot be empty',
      );
    });

    it('should throw error when updating deleted address label', () => {
      userAddress.delete();

      expect(() => userAddress.updateLabel('New Label')).toThrow(
        'Cannot update deleted address',
      );
    });
  });

  describe('updateType', () => {
    let userAddress: UserAddress;

    beforeEach(() => {
      userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false, // Not default so it can be deleted for tests
      );
    });

    it('should update type successfully', () => {
      userAddress.updateType(AddressType.WORK);

      expect(userAddress.type).toBe(AddressType.WORK);
    });

    it('should throw error when updating deleted address type', () => {
      userAddress.delete();

      expect(() => userAddress.updateType(AddressType.WORK)).toThrow(
        'Cannot update deleted address',
      );
    });
  });

  describe('delete', () => {
    let userAddress: UserAddress;

    beforeEach(() => {
      userAddress = UserAddress.create(
        'non-default-123',
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        'Non-default Address',
        false, // Not default for deletion test
      );
    });

    it('should mark address as deleted', () => {
      expect(userAddress.isDeleted()).toBe(false);
      expect(userAddress.deletedAt).toBeUndefined();

      userAddress.delete();

      expect(userAddress.isDeleted()).toBe(true);
      expect(userAddress.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw error when trying to delete already deleted address', () => {
      userAddress.delete();

      expect(() => userAddress.delete()).toThrow('Address is already deleted');
    });

    it('should throw error when trying to delete default address', () => {
      const defaultAddress = UserAddress.create(
        'default-123',
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        true, // Default address
      );

      expect(() => defaultAddress.delete()).toThrow(
        'Cannot delete default address. Set another address as default first',
      );
    });
  });

  describe('isDeleted', () => {
    it('should return false for active address', () => {
      const userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false, // Not default so it can be deleted for tests
      );

      expect(userAddress.isDeleted()).toBe(false);
    });

    it('should return true for deleted address', () => {
      const userAddress = UserAddress.create(
        validAddressData.id,
        validAddressData.userId,
        validAddressData.address,
        validAddressData.type,
        validAddressData.label,
        false, // Not default so it can be deleted
      );

      userAddress.delete();

      expect(userAddress.isDeleted()).toBe(true);
    });
  });
});
