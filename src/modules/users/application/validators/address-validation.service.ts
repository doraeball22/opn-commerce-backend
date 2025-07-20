import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';

@Injectable()
export class AddressValidationService {
  constructor(
    @Inject('UserAddressRepository')
    private readonly userAddressRepository: UserAddressRepository,
  ) {}

  async validateDefaultAddressConstraints(
    userId: string,
    isSettingDefault: boolean = false,
    addressIdToDelete?: string,
  ): Promise<void> {
    const userAddresses = await this.userAddressRepository.findByUserId(userId);

    // If deleting, exclude the address being deleted from count
    const remainingAddresses = addressIdToDelete
      ? userAddresses.filter((addr) => addr.id !== addressIdToDelete)
      : userAddresses;

    // Check if user will have no addresses after operation
    if (remainingAddresses.length === 0) {
      throw new BadRequestException('Users must have at least one address');
    }

    // If not setting a new default, check if user has at least one default
    if (!isSettingDefault) {
      const hasDefaultAddress = remainingAddresses.some(
        (addr) => addr.isDefault,
      );
      if (!hasDefaultAddress) {
        throw new BadRequestException(
          'User must have exactly one default address',
        );
      }
    }
  }

  async validateAddressOwnership(
    userId: string,
    addressId: string,
  ): Promise<void> {
    const address = await this.userAddressRepository.findById(addressId);

    if (!address) {
      throw new BadRequestException('Address not found');
    }

    if (address.userId !== userId) {
      throw new BadRequestException('Address does not belong to user');
    }

    if (address.isDeleted()) {
      throw new BadRequestException('Address has been deleted');
    }
  }

  async validateLocationCoordinates(
    latitude?: number,
    longitude?: number,
  ): Promise<void> {
    // Both coordinates must be provided together or not at all
    if (
      (latitude !== undefined && longitude === undefined) ||
      (latitude === undefined && longitude !== undefined)
    ) {
      throw new BadRequestException(
        'Both latitude and longitude must be provided together',
      );
    }

    if (latitude !== undefined && longitude !== undefined) {
      if (latitude < -90 || latitude > 90) {
        throw new BadRequestException(
          'Latitude must be between -90 and 90 degrees',
        );
      }

      if (longitude < -180 || longitude > 180) {
        throw new BadRequestException(
          'Longitude must be between -180 and 180 degrees',
        );
      }

      // Optional: Validate if coordinates are within Thailand (for business logic)
      // This can be made configurable based on business requirements
      if (
        latitude < 5.6 ||
        latitude > 20.5 ||
        longitude < 97.3 ||
        longitude > 105.6
      ) {
        console.warn(
          `Location coordinates (${latitude}, ${longitude}) are outside Thailand`,
        );
      }
    }
  }

  async validateDuplicateAddress(
    userId: string,
    street: string,
    city: string,
    postalCode: string,
    excludeAddressId?: string,
  ): Promise<void> {
    const userAddresses = await this.userAddressRepository.findByUserId(userId);

    const duplicateAddress = userAddresses.find(
      (addr) =>
        addr.id !== excludeAddressId &&
        addr.address.getStreet().toLowerCase() === street.toLowerCase() &&
        addr.address.getCity().toLowerCase() === city.toLowerCase() &&
        addr.address.getPostalCode() === postalCode,
    );

    if (duplicateAddress) {
      throw new BadRequestException(
        'An address with the same street, city, and postal code already exists',
      );
    }
  }

  async validateAddressLimit(
    userId: string,
    maxAddresses: number = 10,
  ): Promise<void> {
    const addressCount = await this.userAddressRepository.countByUserId(userId);

    if (addressCount >= maxAddresses) {
      throw new BadRequestException(
        `Maximum of ${maxAddresses} addresses allowed per user`,
      );
    }
  }
}
