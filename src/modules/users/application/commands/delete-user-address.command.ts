export class DeleteUserAddressCommand {
  constructor(
    public readonly userId: string,
    public readonly addressId: string,
  ) {}
}
