import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { Gender } from '../value-objects/gender.vo';

export class User {
  private _id: string;
  private _email: Email;
  private _password: Password;
  private _name: string;
  private _dateOfBirth: Date;
  private _gender: Gender;
  private _subscribedToNewsletter: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date;

  constructor(
    id: string,
    email: Email,
    password: Password,
    name: string,
    dateOfBirth: Date,
    gender: Gender,
    subscribedToNewsletter: boolean,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
  ) {
    this._id = id;
    this._email = email;
    this._password = password;
    this._name = name;
    this._dateOfBirth = dateOfBirth;
    this._gender = gender;
    this._subscribedToNewsletter = subscribedToNewsletter;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._deletedAt = deletedAt;
  }

  static create(
    id: string,
    email: string,
    password: string,
    name: string,
    dateOfBirth: Date,
    gender: string,
    subscribedToNewsletter: boolean,
  ): User {
    return new User(
      id,
      new Email(email),
      new Password(password),
      name,
      dateOfBirth,
      new Gender(gender),
      subscribedToNewsletter,
    );
  }

  get id(): string {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get name(): string {
    return this._name;
  }

  get dateOfBirth(): Date {
    return this._dateOfBirth;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this._dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get gender(): Gender {
    return this._gender;
  }

  get subscribedToNewsletter(): boolean {
    return this._subscribedToNewsletter;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  isDeleted(): boolean {
    return !!this._deletedAt;
  }

  updateProfile(
    dateOfBirth?: Date,
    gender?: Gender,
    subscribedToNewsletter?: boolean,
  ): void {
    if (this.isDeleted()) {
      throw new Error('Cannot update a deleted user');
    }

    if (dateOfBirth) {
      this._dateOfBirth = dateOfBirth;
    }
    if (gender) {
      this._gender = gender;
    }
    if (subscribedToNewsletter !== undefined) {
      this._subscribedToNewsletter = subscribedToNewsletter;
    }

    this._updatedAt = new Date();
  }

  changePassword(currentPassword: string, newPassword: string): void {
    if (this.isDeleted()) {
      throw new Error('Cannot change password for a deleted user');
    }

    if (!this._password.compareWith(currentPassword)) {
      throw new Error('Current password is incorrect');
    }

    this._password = new Password(newPassword);
    this._updatedAt = new Date();
  }

  delete(): void {
    if (this.isDeleted()) {
      throw new Error('User is already deleted');
    }

    this._deletedAt = new Date();
  }
}
