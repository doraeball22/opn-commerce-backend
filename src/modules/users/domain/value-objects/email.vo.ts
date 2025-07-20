export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.validate(value)) {
      throw new Error('Invalid email format');
    }
    this._value = value.toLowerCase();
  }

  get value(): string {
    return this._value;
  }

  private validate(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
