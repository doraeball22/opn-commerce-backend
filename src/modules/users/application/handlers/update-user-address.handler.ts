import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserAddressCommand } from '../commands/update-user-address.command';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';
import {
  UserAddress,
  AddressType,
} from '../../domain/entities/user-address.entity';
import { Address } from '../../domain/value-objects/address.vo';
import { Location } from '../../domain/value-objects/location.vo';

@CommandHandler(UpdateUserAddressCommand)
export class UpdateUserAddressHandler
  implements ICommandHandler<UpdateUserAddressCommand>
{
  constructor(
    @Inject('UserAddressRepository')
    private readonly userAddressRepository: UserAddressRepository,
  ) {}

  async execute(command: UpdateUserAddressCommand): Promise<UserAddress> {
    const { userId, addressId, address, type, label } = command;

    // Find the address
    const userAddress = await this.userAddressRepository.findById(addressId);
    if (!userAddress) {
      throw new Error('Address not found');
    }

    // Verify ownership
    if (userAddress.userId !== userId) {
      throw new Error('Address does not belong to user');
    }

    // Update address if provided
    if (address) {
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

      userAddress.updateAddress(
        addressVO,
        locationVO,
        address.deliveryInstructions,
      );
    }

    // Update type if provided
    if (type) {
      userAddress.updateType(type as AddressType);
    }

    // Update label if provided
    if (label) {
      userAddress.updateLabel(label);
    }

    return await this.userAddressRepository.update(userAddress);
  }
}
