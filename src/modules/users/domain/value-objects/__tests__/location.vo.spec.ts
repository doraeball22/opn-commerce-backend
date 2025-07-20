import { Location } from '../location.vo';

describe('Location Value Object', () => {
  describe('constructor', () => {
    it('should create location with valid coordinates', () => {
      const location = new Location(13.7563, 100.5018);

      expect(location.latitude).toBe(13.7563);
      expect(location.longitude).toBe(100.5018);
    });

    it('should round coordinates to 8 decimal places', () => {
      const location = new Location(13.123456789, 100.987654321);

      expect(location.latitude).toBe(13.12345679);
      expect(location.longitude).toBe(100.98765432);
    });

    it('should throw error for invalid latitude', () => {
      expect(() => new Location(-91, 100)).toThrow(
        'Invalid latitude. Must be between -90 and 90 degrees',
      );
      expect(() => new Location(91, 100)).toThrow(
        'Invalid latitude. Must be between -90 and 90 degrees',
      );
    });

    it('should throw error for invalid longitude', () => {
      expect(() => new Location(13, -181)).toThrow(
        'Invalid longitude. Must be between -180 and 180 degrees',
      );
      expect(() => new Location(13, 181)).toThrow(
        'Invalid longitude. Must be between -180 and 180 degrees',
      );
    });

    it('should accept boundary values', () => {
      expect(() => new Location(-90, -180)).not.toThrow();
      expect(() => new Location(90, 180)).not.toThrow();
      expect(() => new Location(0, 0)).not.toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for identical locations', () => {
      const location1 = new Location(13.7563, 100.5018);
      const location2 = new Location(13.7563, 100.5018);

      expect(location1.equals(location2)).toBe(true);
    });

    it('should return false for different locations', () => {
      const location1 = new Location(13.7563, 100.5018);
      const location2 = new Location(18.7883, 98.9853);

      expect(location1.equals(location2)).toBe(false);
    });

    it('should handle precision correctly', () => {
      const location1 = new Location(13.123456789, 100.987654321);
      const location2 = new Location(13.12345679, 100.98765432);

      expect(location1.equals(location2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return formatted coordinate string', () => {
      const location = new Location(13.7563, 100.5018);

      expect(location.toString()).toBe('13.7563, 100.5018');
    });
  });

  describe('distanceTo', () => {
    it('should calculate distance between two locations', () => {
      const bangkok = new Location(13.7563, 100.5018);
      const chiangMai = new Location(18.7883, 98.9853);

      const distance = bangkok.distanceTo(chiangMai);

      // Approximate distance between Bangkok and Chiang Mai is ~582 km
      expect(distance).toBeCloseTo(582, 0);
    });

    it('should return 0 for same location', () => {
      const location = new Location(13.7563, 100.5018);

      expect(location.distanceTo(location)).toBe(0);
    });

    it('should calculate short distances accurately', () => {
      const location1 = new Location(13.7563, 100.5018);
      const location2 = new Location(13.7564, 100.5019); // Very close

      const distance = location1.distanceTo(location2);

      expect(distance).toBeLessThan(0.2); // Less than 200 meters
    });
  });

  describe('isInThailand', () => {
    it('should return true for Bangkok coordinates', () => {
      const bangkok = new Location(13.7563, 100.5018);

      expect(bangkok.isInThailand()).toBe(true);
    });

    it('should return true for Chiang Mai coordinates', () => {
      const chiangMai = new Location(18.7883, 98.9853);

      expect(chiangMai.isInThailand()).toBe(true);
    });

    it('should return true for Phuket coordinates', () => {
      const phuket = new Location(7.8804, 98.3923);

      expect(phuket.isInThailand()).toBe(true);
    });

    it('should return false for coordinates outside Thailand', () => {
      const singapore = new Location(1.3521, 103.8198);
      const tokyo = new Location(35.6762, 139.6503);

      expect(singapore.isInThailand()).toBe(false);
      expect(tokyo.isInThailand()).toBe(false);
    });

    it('should return false for coordinates at boundaries', () => {
      const outsideNorth = new Location(21, 100);
      const outsideSouth = new Location(5, 100);
      const outsideEast = new Location(15, 106);
      const outsideWest = new Location(15, 97);

      expect(outsideNorth.isInThailand()).toBe(false);
      expect(outsideSouth.isInThailand()).toBe(false);
      expect(outsideEast.isInThailand()).toBe(false);
      expect(outsideWest.isInThailand()).toBe(false);
    });
  });

  describe('getGoogleMapsUrl', () => {
    it('should return correct Google Maps URL', () => {
      const location = new Location(13.7563, 100.5018);

      const url = location.getGoogleMapsUrl();

      expect(url).toBe('https://www.google.com/maps?q=13.7563,100.5018');
    });

    it('should handle negative coordinates', () => {
      const location = new Location(-33.8688, 151.2093); // Sydney

      const url = location.getGoogleMapsUrl();

      expect(url).toBe('https://www.google.com/maps?q=-33.8688,151.2093');
    });
  });
});
