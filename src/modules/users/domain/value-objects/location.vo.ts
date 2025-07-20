export class Location {
  private readonly _latitude: number;
  private readonly _longitude: number;

  constructor(latitude: number, longitude: number) {
    if (!this.isValidLatitude(latitude)) {
      throw new Error('Invalid latitude. Must be between -90 and 90 degrees');
    }

    if (!this.isValidLongitude(longitude)) {
      throw new Error(
        'Invalid longitude. Must be between -180 and 180 degrees',
      );
    }

    this._latitude = Number(latitude.toFixed(8)); // Precision to ~1.1 meters
    this._longitude = Number(longitude.toFixed(8));
  }

  private isValidLatitude(lat: number): boolean {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
  }

  private isValidLongitude(lng: number): boolean {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  equals(other: Location): boolean {
    return (
      this._latitude === other._latitude && this._longitude === other._longitude
    );
  }

  toString(): string {
    return `${this._latitude}, ${this._longitude}`;
  }

  // Calculate distance between two locations using Haversine formula (in kilometers)
  distanceTo(other: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(other._latitude - this._latitude);
    const dLng = this.toRadians(other._longitude - this._longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this._latitude)) *
        Math.cos(this.toRadians(other._latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if location is within Thailand's approximate bounds
  isInThailand(): boolean {
    return (
      this._latitude >= 5.6 &&
      this._latitude <= 20.5 &&
      this._longitude >= 97.3 &&
      this._longitude <= 105.6
    );
  }

  // Get Google Maps URL for this location
  getGoogleMapsUrl(): string {
    return `https://www.google.com/maps?q=${this._latitude},${this._longitude}`;
  }
}
