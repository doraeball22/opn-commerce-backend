import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteUserAddressCommand } from '../commands/delete-user-address.command';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';
import { AddressValidationService } from '../validators/address-validation.service';

@CommandHandler(DeleteUserAddressCommand)
export class DeleteUserAddressHandler
  implements ICommandHandler<DeleteUserAddressCommand>
{
  constructor(
    @Inject('UserAddressRepository')
    private readonly userAddressRepository: UserAddressRepository,
    private readonly addressValidationService: AddressValidationService,
  ) {}

  async execute(command: DeleteUserAddressCommand): Promise<void> {
    const { userId, addressId } = command;

    // Validate address ownership
    await this.addressValidationService.validateAddressOwnership(
      userId,
      addressId,
    );

    // Validate deletion constraints
    await this.addressValidationService.validateDefaultAddressConstraints(
      userId,
      false,
      addressId,
    );

    // Find the address
    const userAddress = await this.userAddressRepository.findById(addressId);
    if (!userAddress) {
      throw new Error('Address not found after validation');
    }

    // If this is the default address, we need to set another one as default
    if (userAddress.isDefault) {
      // Find other addresses for this user
      const userAddresses =
        await this.userAddressRepository.findByUserId(userId);
      const otherAddresses = userAddresses.filter(
        (addr) => addr.id !== addressId,
      );
      if (otherAddresses.length > 0) {
        const newDefaultAddress = otherAddresses[0];
        await this.userAddressRepository.setAsDefault(
          newDefaultAddress.id,
          userId,
        );
      }
    }

    // Delete the address
    userAddress.delete();
    await this.userAddressRepository.update(userAddress);
  }
}
