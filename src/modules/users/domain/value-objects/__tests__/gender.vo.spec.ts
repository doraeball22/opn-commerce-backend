import { Gender, GenderType } from '../gender.vo';

describe('Gender Value Object', () => {
  describe('constructor', () => {
    it('should create gender with valid values', () => {
      const male = new Gender('MALE');
      const female = new Gender('FEMALE');
      const other = new Gender('OTHER');

      expect(male.value).toBe(GenderType.MALE);
      expect(female.value).toBe(GenderType.FEMALE);
      expect(other.value).toBe(GenderType.OTHER);
    });

    it('should convert to uppercase', () => {
      const male = new Gender('male');
      const female = new Gender('female');
      const other = new Gender('other');

      expect(male.value).toBe(GenderType.MALE);
      expect(female.value).toBe(GenderType.FEMALE);
      expect(other.value).toBe(GenderType.OTHER);
    });

    it('should handle mixed case', () => {
      const male = new Gender('Male');
      const female = new Gender('FeMaLe');
      const other = new Gender('oThEr');

      expect(male.value).toBe(GenderType.MALE);
      expect(female.value).toBe(GenderType.FEMALE);
      expect(other.value).toBe(GenderType.OTHER);
    });

    it('should throw error for invalid gender values', () => {
      expect(() => new Gender('INVALID')).toThrow(
        'Invalid gender value. Must be MALE, FEMALE, or OTHER',
      );
      expect(() => new Gender('MAN')).toThrow(
        'Invalid gender value. Must be MALE, FEMALE, or OTHER',
      );
      expect(() => new Gender('WOMAN')).toThrow(
        'Invalid gender value. Must be MALE, FEMALE, or OTHER',
      );
      expect(() => new Gender('')).toThrow(
        'Invalid gender value. Must be MALE, FEMALE, or OTHER',
      );
      expect(() => new Gender('123')).toThrow(
        'Invalid gender value. Must be MALE, FEMALE, or OTHER',
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal genders', () => {
      const gender1 = new Gender('MALE');
      const gender2 = new Gender('male');
      expect(gender1.equals(gender2)).toBe(true);
    });

    it('should return false for different genders', () => {
      const male = new Gender('MALE');
      const female = new Gender('FEMALE');
      expect(male.equals(female)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return gender as string', () => {
      const male = new Gender('male');
      expect(male.toString()).toBe('MALE');
    });
  });

  describe('GenderType enum', () => {
    it('should have correct values', () => {
      expect(GenderType.MALE).toBe('MALE');
      expect(GenderType.FEMALE).toBe('FEMALE');
      expect(GenderType.OTHER).toBe('OTHER');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(GenderType);
      expect(values).toHaveLength(3);
    });
  });
});
