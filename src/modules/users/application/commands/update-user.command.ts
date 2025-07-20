export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly dateOfBirth?: Date,
    public readonly gender?: string,
    public readonly subscribedToNewsletter?: boolean,
  ) {}
}
