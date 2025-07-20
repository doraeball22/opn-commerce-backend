import { User } from '../user.entity';
import { Email } from '../../value-objects/email.vo';
import { Password } from '../../value-objects/password.vo';
import { Address } from '../../value-objects/address.vo';
import { Gender } from '../../value-objects/gender.vo';

describe('User Entity', () => {
  const validUserData = {
    id: 'user-123',
    email: 'john.doe@example.com',
    password: 'password123',
    name: 'John Doe',
    dateOfBirth: new Date('1990-01-15'),
    gender: 'MALE',
    subscribedToNewsletter: true,
  };

  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        validUserData.dateOfBirth,
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );

      expect(user.id).toBe(validUserData.id);
      expect(user.email.value).toBe(validUserData.email);
      expect(user.name).toBe(validUserData.name);
      expect(user.dateOfBirth).toBe(validUserData.dateOfBirth);
      expect(user.gender.value).toBe(validUserData.gender);
      expect(user.subscribedToNewsletter).toBe(
        validUserData.subscribedToNewsletter,
      );
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.deletedAt).toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('should create user with all parameters', () => {
      const email = new Email(validUserData.email);
      const password = new Password(validUserData.password);
      const gender = new Gender(validUserData.gender);
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const user = new User(
        validUserData.id,
        email,
        password,
        validUserData.name,
        validUserData.dateOfBirth,
        gender,
        validUserData.subscribedToNewsletter,
        createdAt,
        updatedAt,
      );

      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });

  describe('age calculation', () => {
    beforeEach(() => {
      // Mock current date to January 15, 2024
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate correct age', () => {
      const user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        new Date('1990-01-15'), // Birthday today, should be exactly 34
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );

      expect(user.age).toBe(34);
    });

    it('should calculate age when birthday has not occurred this year', () => {
      const user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        new Date('1990-06-15'), // Birthday later this year
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );

      expect(user.age).toBe(33);
    });

    it('should calculate age when birthday has already occurred this year', () => {
      const user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        new Date('1989-12-01'), // Birthday already passed this year
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );

      expect(user.age).toBe(34);
    });
  });

  describe('updateProfile', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        validUserData.dateOfBirth,
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );
    });

    it('should update date of birth', () => {
      const newDateOfBirth = new Date('1995-05-20');
      user.updateProfile(newDateOfBirth);

      expect(user.dateOfBirth).toBe(newDateOfBirth);
    });

    it('should update gender', () => {
      const newGender = new Gender('FEMALE');
      user.updateProfile(undefined, newGender);

      expect(user.gender.value).toBe('FEMALE');
    });

    it('should update gender', () => {
      const newGender = new Gender('OTHER');
      user.updateProfile(undefined, newGender);

      expect(user.gender.value).toBe('OTHER');
    });

    it('should update newsletter subscription', () => {
      user.updateProfile(undefined, undefined, false);

      expect(user.subscribedToNewsletter).toBe(false);
    });

    it('should update multiple fields at once', () => {
      const newDateOfBirth = new Date('1995-05-20');
      const newGender = new Gender('OTHER');

      user.updateProfile(newDateOfBirth, newGender, false);

      expect(user.dateOfBirth).toBe(newDateOfBirth);
      expect(user.gender.value).toBe('OTHER');
      expect(user.subscribedToNewsletter).toBe(false);
    });

    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.updateProfile(undefined, undefined, false);

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when trying to update deleted user', () => {
      user.delete();

      expect(() => user.updateProfile(undefined, undefined, false)).toThrow(
        'Cannot update a deleted user',
      );
    });
  });

  describe('changePassword', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        validUserData.dateOfBirth,
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );
    });

    it('should change password with correct current password', () => {
      const oldPasswordValue = user.password.value;

      user.changePassword(validUserData.password, 'newPassword123');

      expect(user.password.value).not.toBe(oldPasswordValue);
      expect(user.password.compareWith('newPassword123')).toBe(true);
      expect(user.password.compareWith(validUserData.password)).toBe(false);
    });

    it('should update updatedAt timestamp when changing password', async () => {
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.changePassword(validUserData.password, 'newPassword123');

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error with incorrect current password', () => {
      expect(() =>
        user.changePassword('wrongPassword', 'newPassword123'),
      ).toThrow('Current password is incorrect');
    });

    it('should throw error when trying to change password for deleted user', () => {
      user.delete();

      expect(() =>
        user.changePassword(validUserData.password, 'newPassword123'),
      ).toThrow('Cannot change password for a deleted user');
    });
  });

  describe('delete', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        validUserData.dateOfBirth,
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );
    });

    it('should mark user as deleted', () => {
      expect(user.isDeleted()).toBe(false);
      expect(user.deletedAt).toBeUndefined();

      user.delete();

      expect(user.isDeleted()).toBe(true);
      expect(user.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw error when trying to delete already deleted user', () => {
      user.delete();

      expect(() => user.delete()).toThrow('User is already deleted');
    });
  });

  describe('isDeleted', () => {
    it('should return false for active user', () => {
      const user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        validUserData.dateOfBirth,
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );

      expect(user.isDeleted()).toBe(false);
    });

    it('should return true for deleted user', () => {
      const user = User.create(
        validUserData.id,
        validUserData.email,
        validUserData.password,
        validUserData.name,
        validUserData.dateOfBirth,
        validUserData.gender,
        validUserData.subscribedToNewsletter,
      );

      user.delete();

      expect(user.isDeleted()).toBe(true);
    });
  });
});
