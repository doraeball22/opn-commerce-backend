import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';
import { User } from '../../domain/entities/user.entity';
import {
  UserAddress,
  AddressType,
} from '../../domain/entities/user-address.entity';
import { Address } from '../../domain/value-objects/address.vo';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('UserAddressRepository')
    private readonly userAddressRepository: UserAddressRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const {
      email,
      password,
      name,
      dateOfBirth,
      gender,
      address,
      subscribedToNewsletter,
      addressType,
      addressLabel,
    } = command;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const userId = uuidv4();

    // Create new user (without address)
    const user = User.create(
      userId,
      email,
      password,
      name,
      dateOfBirth,
      gender,
      subscribedToNewsletter,
    );

    // Save user first
    await this.userRepository.save(user);

    // Create address value object
    const addressVO = new Address(
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    );

    // Create initial address (always default for new users)
    const userAddress = UserAddress.create(
      uuidv4(),
      userId,
      addressVO,
      addressType || AddressType.HOME,
      addressLabel || 'Home',
      true, // First address is always default
    );

    // Save the address
    await this.userAddressRepository.save(userAddress);
  }
}
