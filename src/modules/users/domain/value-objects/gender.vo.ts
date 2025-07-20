export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class Gender {
  private readonly _value: GenderType;

  constructor(value: string) {
    const uppercasedValue = value.toUpperCase();
    if (!Object.values(GenderType).includes(uppercasedValue as GenderType)) {
      throw new Error('Invalid gender value. Must be MALE, FEMALE, or OTHER');
    }
    this._value = uppercasedValue as GenderType;
  }

  get value(): GenderType {
    return this._value;
  }

  equals(other: Gender): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
