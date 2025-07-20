import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddUserAddressCommand } from '../commands/add-user-address.command';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import {
  UserAddress,
  AddressType,
} from '../../domain/entities/user-address.entity';
import { Address } from '../../domain/value-objects/address.vo';
import { Location } from '../../domain/value-objects/location.vo';
import { AddressValidationService } from '../validators/address-validation.service';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(AddUserAddressCommand)
export class AddUserAddressHandler
  implements ICommandHandler<AddUserAddressCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('UserAddressRepository')
    private readonly userAddressRepository: UserAddressRepository,
    private readonly addressValidationService: AddressValidationService,
  ) {}

  async execute(command: AddUserAddressCommand): Promise<UserAddress> {
    const { userId, address, type, label, isDefault } = command;

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isDeleted()) {
      throw new Error('Cannot add address to deleted user');
    }

    // Validate address constraints
    await this.addressValidationService.validateAddressLimit(userId);
    await this.addressValidationService.validateLocationCoordinates(
      address.latitude,
      address.longitude,
    );
    await this.addressValidationService.validateDuplicateAddress(
      userId,
      address.street,
      address.city,
      address.postalCode,
    );

    // Create address value object
    const addressVO = new Address(
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    );

    // Create location if coordinates provided
    let locationVO: Location | undefined;
    if (address.latitude !== undefined && address.longitude !== undefined) {
      locationVO = new Location(address.latitude, address.longitude);
    }

    // If this will be the default address or no addresses exist, handle default logic
    const existingAddresses =
      await this.userAddressRepository.findByUserId(userId);
    const willBeDefault = isDefault || existingAddresses.length === 0;

    // If setting as default, unset current default
    if (willBeDefault) {
      await this.userAddressRepository.unsetDefault(userId);
    }

    // Create new address
    const userAddress = UserAddress.create(
      uuidv4(),
      userId,
      addressVO,
      type as AddressType,
      label,
      willBeDefault,
      locationVO,
      address.deliveryInstructions,
    );

    return await this.userAddressRepository.save(userAddress);
  }
}
