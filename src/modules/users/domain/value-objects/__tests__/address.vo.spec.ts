import { Address } from '../address.vo';

describe('Address Value Object', () => {
  const validAddressData = {
    street: '123 Main St',
    city: 'Bangkok',
    state: 'Bangkok',
    postalCode: '10110',
    country: 'Thailand',
  };

  describe('constructor', () => {
    it('should create address with valid data', () => {
      const address = new Address(
        validAddressData.street,
        validAddressData.city,
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      expect(address.getStreet()).toBe(validAddressData.street);
      expect(address.getCity()).toBe(validAddressData.city);
      expect(address.getState()).toBe(validAddressData.state);
      expect(address.getPostalCode()).toBe(validAddressData.postalCode);
      expect(address.getCountry()).toBe(validAddressData.country);
    });

    it('should throw error for missing street', () => {
      expect(
        () =>
          new Address(
            '',
            validAddressData.city,
            validAddressData.state,
            validAddressData.postalCode,
            validAddressData.country,
          ),
      ).toThrow('All address fields are required');
    });

    it('should throw error for missing city', () => {
      expect(
        () =>
          new Address(
            validAddressData.street,
            '',
            validAddressData.state,
            validAddressData.postalCode,
            validAddressData.country,
          ),
      ).toThrow('All address fields are required');
    });

    it('should throw error for missing state', () => {
      expect(
        () =>
          new Address(
            validAddressData.street,
            validAddressData.city,
            '',
            validAddressData.postalCode,
            validAddressData.country,
          ),
      ).toThrow('All address fields are required');
    });

    it('should throw error for missing postal code', () => {
      expect(
        () =>
          new Address(
            validAddressData.street,
            validAddressData.city,
            validAddressData.state,
            '',
            validAddressData.country,
          ),
      ).toThrow('All address fields are required');
    });

    it('should throw error for missing country', () => {
      expect(
        () =>
          new Address(
            validAddressData.street,
            validAddressData.city,
            validAddressData.state,
            validAddressData.postalCode,
            '',
          ),
      ).toThrow('All address fields are required');
    });
  });

  describe('getters', () => {
    let address: Address;

    beforeEach(() => {
      address = new Address(
        validAddressData.street,
        validAddressData.city,
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );
    });

    it('should return correct street', () => {
      expect(address.getStreet()).toBe(validAddressData.street);
    });

    it('should return correct city', () => {
      expect(address.getCity()).toBe(validAddressData.city);
    });

    it('should return correct state', () => {
      expect(address.getState()).toBe(validAddressData.state);
    });

    it('should return correct postal code', () => {
      expect(address.getPostalCode()).toBe(validAddressData.postalCode);
    });

    it('should return correct country', () => {
      expect(address.getCountry()).toBe(validAddressData.country);
    });
  });

  describe('equals', () => {
    it('should return true for identical addresses', () => {
      const address1 = new Address(
        validAddressData.street,
        validAddressData.city,
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      const address2 = new Address(
        validAddressData.street,
        validAddressData.city,
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      expect(address1.equals(address2)).toBe(true);
    });

    it('should return false for different streets', () => {
      const address1 = new Address(
        '123 Main St',
        validAddressData.city,
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      const address2 = new Address(
        '456 Oak Ave',
        validAddressData.city,
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      expect(address1.equals(address2)).toBe(false);
    });

    it('should return false for different cities', () => {
      const address1 = new Address(
        validAddressData.street,
        'Bangkok',
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      const address2 = new Address(
        validAddressData.street,
        'Chiang Mai',
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      expect(address1.equals(address2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted address string', () => {
      const address = new Address(
        validAddressData.street,
        validAddressData.city,
        validAddressData.state,
        validAddressData.postalCode,
        validAddressData.country,
      );

      const expected = `${validAddressData.street}, ${validAddressData.city}, ${validAddressData.state} ${validAddressData.postalCode}, ${validAddressData.country}`;
      expect(address.toString()).toBe(expected);
    });
  });
});
