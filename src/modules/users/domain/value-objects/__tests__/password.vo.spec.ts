import { Password } from '../password.vo';

describe('Password Value Object', () => {
  describe('constructor', () => {
    it('should create a password and hash it', () => {
      const password = new Password('password123');
      expect(password.value).toBeDefined();
      expect(password.value).not.toBe('password123'); // Should be hashed
      expect(password.value.length).toBeGreaterThan(0);
    });

    it('should accept already hashed password', () => {
      const hashedPassword = '$2b$10$hashedpassword';
      const password = new Password(hashedPassword, true);
      expect(password.value).toBe(hashedPassword);
    });

    it('should throw error for password less than 8 characters', () => {
      expect(() => new Password('1234567')).toThrow(
        'Password must be at least 8 characters long',
      );
      expect(() => new Password('short')).toThrow(
        'Password must be at least 8 characters long',
      );
      expect(() => new Password('')).toThrow(
        'Password must be at least 8 characters long',
      );
    });
  });

  describe('compareWith', () => {
    it('should return true for matching password', () => {
      const password = new Password('password123');
      expect(password.compareWith('password123')).toBe(true);
    });

    it('should return false for non-matching password', () => {
      const password = new Password('password123');
      expect(password.compareWith('wrongpassword')).toBe(false);
      expect(password.compareWith('PASSWORD123')).toBe(false);
    });

    it('should work with different valid passwords', () => {
      const password1 = new Password('mySecretPassword');
      const password2 = new Password('anotherPassword');

      expect(password1.compareWith('mySecretPassword')).toBe(true);
      expect(password1.compareWith('anotherPassword')).toBe(false);

      expect(password2.compareWith('anotherPassword')).toBe(true);
      expect(password2.compareWith('mySecretPassword')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for passwords with same hash', () => {
      const hashedPassword = '$2b$10$samehashedpassword';
      const password1 = new Password(hashedPassword, true);
      const password2 = new Password(hashedPassword, true);
      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false for passwords with different hashes', () => {
      const password1 = new Password('password123');
      const password2 = new Password('password456');
      expect(password1.equals(password2)).toBe(false);
    });
  });
});
