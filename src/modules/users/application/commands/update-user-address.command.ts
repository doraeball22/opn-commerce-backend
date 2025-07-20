import { AddressDto } from '../dto/address.dto';

export class UpdateUserAddressCommand {
  constructor(
    public readonly userId: string,
    public readonly addressId: string,
    public readonly address?: AddressDto,
    public readonly type?: string,
    public readonly label?: string,
  ) {}
}
