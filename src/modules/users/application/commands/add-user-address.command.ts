import { AddressDto } from '../dto/address.dto';

export class AddUserAddressCommand {
  constructor(
    public readonly userId: string,
    public readonly address: AddressDto,
    public readonly type: string,
    public readonly label: string,
    public readonly isDefault: boolean = false,
  ) {}
}
