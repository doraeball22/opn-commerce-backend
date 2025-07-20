import { Email } from '../email.vo';

describe('Email Value Object', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email('john.doe@example.com');
      expect(email.value).toBe('john.doe@example.com');
    });

    it('should convert email to lowercase', () => {
      const email = new Email('JOHN.DOE@EXAMPLE.COM');
      expect(email.value).toBe('john.doe@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
      expect(() => new Email('test@')).toThrow('Invalid email format');
      expect(() => new Email('@test.com')).toThrow('Invalid email format');
      expect(() => new Email('test.com')).toThrow('Invalid email format');
    });

    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Invalid email format');
      expect(() => new Email('   ')).toThrow('Invalid email format');
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for equal emails with different cases', () => {
      const email1 = new Email('TEST@EXAMPLE.COM');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email as string', () => {
      const email = new Email('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});
