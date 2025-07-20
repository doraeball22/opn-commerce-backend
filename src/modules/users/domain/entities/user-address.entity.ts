import { Address } from '../value-objects/address.vo';
import { Location } from '../value-objects/location.vo';

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  OTHER = 'OTHER',
}

export class UserAddress {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly address: Address,
    public readonly type: AddressType,
    public readonly label: string,
    private _isDefault: boolean = false,
    public readonly location?: Location,
    public readonly deliveryInstructions?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt?: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    address: Address,
    type: AddressType,
    label: string,
    isDefault: boolean = false,
    location?: Location,
    deliveryInstructions?: string,
  ): UserAddress {
    return new UserAddress(
      id,
      userId,
      address,
      type,
      label,
      isDefault,
      location,
      deliveryInstructions,
    );
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  setAsDefault(): void {
    if (this.isDeleted()) {
      throw new Error('Cannot set deleted address as default');
    }
    this._isDefault = true;
  }

  unsetAsDefault(): void {
    this._isDefault = false;
  }

  updateAddress(
    address: Address,
    location?: Location,
    deliveryInstructions?: string,
  ): void {
    if (this.isDeleted()) {
      throw new Error('Cannot update deleted address');
    }

    Object.assign(this, {
      address,
      location,
      deliveryInstructions,
      updatedAt: new Date(),
    });
  }

  updateLabel(label: string): void {
    if (this.isDeleted()) {
      throw new Error('Cannot update deleted address');
    }

    if (!label || label.trim().length === 0) {
      throw new Error('Address label cannot be empty');
    }

    Object.assign(this, {
      label: label.trim(),
      updatedAt: new Date(),
    });
  }

  updateType(type: AddressType): void {
    if (this.isDeleted()) {
      throw new Error('Cannot update deleted address');
    }

    Object.assign(this, {
      type,
      updatedAt: new Date(),
    });
  }

  delete(): void {
    if (this.isDeleted()) {
      throw new Error('Address is already deleted');
    }

    if (this._isDefault) {
      throw new Error(
        'Cannot delete default address. Set another address as default first',
      );
    }

    Object.assign(this, {
      deletedAt: new Date(),
    });
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }
}
