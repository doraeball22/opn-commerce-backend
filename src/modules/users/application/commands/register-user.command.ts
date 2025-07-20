import { AddressType } from '../../domain/entities/user-address.entity';

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
    public readonly dateOfBirth: Date,
    public readonly gender: string,
    public readonly address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    },
    public readonly subscribedToNewsletter: boolean,
    public readonly addressType?: AddressType,
    public readonly addressLabel?: string,
  ) {}
}
