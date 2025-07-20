export class GetUserAddressesQuery {
  constructor(
    public readonly userId: string,
    public readonly type?: string,
  ) {}
}
