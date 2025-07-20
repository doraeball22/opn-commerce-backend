import * as bcrypt from 'bcrypt';

export class Password {
  private readonly _value: string;

  constructor(value: string, isHashed: boolean = false) {
    if (isHashed) {
      this._value = value;
    } else {
      if (!this.validate(value)) {
        throw new Error('Password must be at least 8 characters long');
      }
      this._value = this.hashPassword(value);
    }
  }

  get value(): string {
    return this._value;
  }

  private validate(password: string): boolean {
    return password.length >= 8;
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  compareWith(plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, this._value);
  }

  equals(other: Password): boolean {
    return this._value === other._value;
  }
}
