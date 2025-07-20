import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SetDefaultAddressCommand } from '../commands/set-default-address.command';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';
import { UserAddress } from '../../domain/entities/user-address.entity';

@CommandHandler(SetDefaultAddressCommand)
export class SetDefaultAddressHandler
  implements ICommandHandler<SetDefaultAddressCommand>
{
  constructor(
    @Inject('UserAddressRepository')
    private readonly userAddressRepository: UserAddressRepository,
  ) {}

  async execute(command: SetDefaultAddressCommand): Promise<UserAddress> {
    const { userId, addressId } = command;

    // Find the address
    const userAddress = await this.userAddressRepository.findById(addressId);
    if (!userAddress) {
      throw new Error('Address not found');
    }

    // Verify ownership
    if (userAddress.userId !== userId) {
      throw new Error('Address does not belong to user');
    }

    // Set as default (this will unset other defaults automatically)
    await this.userAddressRepository.setAsDefault(addressId, userId);

    // Return updated address
    const updatedAddress = await this.userAddressRepository.findById(addressId);
    if (!updatedAddress) {
      throw new Error('Address not found after update');
    }
    return updatedAddress;
  }
}
