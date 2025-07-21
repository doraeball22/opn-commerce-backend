export enum DimensionUnit {
  MILLIMETERS = 'mm',
  CENTIMETERS = 'cm',
  METERS = 'm',
  INCHES = 'in',
  FEET = 'ft',
}

export class ProductDimensions {
  private constructor(
    private readonly length: number,
    private readonly width: number,
    private readonly height: number,
    private readonly unit: DimensionUnit,
  ) {
    this.validate(length, width, height, unit);
  }

  static create(
    length: number,
    width: number,
    height: number,
    unit: DimensionUnit = DimensionUnit.CENTIMETERS,
  ): ProductDimensions {
    return new ProductDimensions(length, width, height, unit);
  }

  static fromString(dimensionsString: string): ProductDimensions {
    // Expected format: "10x15x20 cm" or "10 x 15 x 20 cm"
    const match = dimensionsString
      .trim()
      .match(
        /^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m|in|ft)$/i,
      );
    if (!match) {
      throw new Error(
        'Invalid dimensions format. Expected format: "10x15x20 cm"',
      );
    }

    const length = parseFloat(match[1]);
    const width = parseFloat(match[2]);
    const height = parseFloat(match[3]);
    const unitString = match[4].toLowerCase();

    let unit: DimensionUnit;
    switch (unitString) {
      case 'mm':
        unit = DimensionUnit.MILLIMETERS;
        break;
      case 'cm':
        unit = DimensionUnit.CENTIMETERS;
        break;
      case 'm':
        unit = DimensionUnit.METERS;
        break;
      case 'in':
        unit = DimensionUnit.INCHES;
        break;
      case 'ft':
        unit = DimensionUnit.FEET;
        break;
      default:
        throw new Error(`Unsupported dimension unit: ${unitString}`);
    }

    return new ProductDimensions(length, width, height, unit);
  }

  getLength(): number {
    return this.length;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getUnit(): DimensionUnit {
    return this.unit;
  }

  toString(): string {
    return `${this.length}x${this.width}x${this.height} ${this.unit}`;
  }

  equals(other: ProductDimensions): boolean {
    // Convert both to millimeters for comparison
    const thisInMm = this.toMillimeters();
    const otherInMm = other.toMillimeters();

    return (
      thisInMm.length === otherInMm.length &&
      thisInMm.width === otherInMm.width &&
      thisInMm.height === otherInMm.height
    );
  }

  // Conversion methods
  toMillimeters(): { length: number; width: number; height: number } {
    const factor = this.getConversionToMillimeters();
    return {
      length: this.length * factor,
      width: this.width * factor,
      height: this.height * factor,
    };
  }

  toCentimeters(): { length: number; width: number; height: number } {
    const mm = this.toMillimeters();
    return {
      length: mm.length / 10,
      width: mm.width / 10,
      height: mm.height / 10,
    };
  }

  toMeters(): { length: number; width: number; height: number } {
    const mm = this.toMillimeters();
    return {
      length: mm.length / 1000,
      width: mm.width / 1000,
      height: mm.height / 1000,
    };
  }

  toInches(): { length: number; width: number; height: number } {
    const mm = this.toMillimeters();
    return {
      length: mm.length / 25.4,
      width: mm.width / 25.4,
      height: mm.height / 25.4,
    };
  }

  toFeet(): { length: number; width: number; height: number } {
    const inches = this.toInches();
    return {
      length: inches.length / 12,
      width: inches.width / 12,
      height: inches.height / 12,
    };
  }

  convertTo(targetUnit: DimensionUnit): ProductDimensions {
    if (this.unit === targetUnit) {
      return this;
    }

    let targetDimensions: { length: number; width: number; height: number };

    switch (targetUnit) {
      case DimensionUnit.MILLIMETERS:
        targetDimensions = this.toMillimeters();
        break;
      case DimensionUnit.CENTIMETERS:
        targetDimensions = this.toCentimeters();
        break;
      case DimensionUnit.METERS:
        targetDimensions = this.toMeters();
        break;
      case DimensionUnit.INCHES:
        targetDimensions = this.toInches();
        break;
      case DimensionUnit.FEET:
        targetDimensions = this.toFeet();
        break;
      default:
        throw new Error(`Unknown target dimension unit: ${targetUnit}`);
    }

    // Round to 3 decimal places
    const roundedDimensions = {
      length: Math.round(targetDimensions.length * 1000) / 1000,
      width: Math.round(targetDimensions.width * 1000) / 1000,
      height: Math.round(targetDimensions.height * 1000) / 1000,
    };

    return new ProductDimensions(
      roundedDimensions.length,
      roundedDimensions.width,
      roundedDimensions.height,
      targetUnit,
    );
  }

  private getConversionToMillimeters(): number {
    switch (this.unit) {
      case DimensionUnit.MILLIMETERS:
        return 1;
      case DimensionUnit.CENTIMETERS:
        return 10;
      case DimensionUnit.METERS:
        return 1000;
      case DimensionUnit.INCHES:
        return 25.4;
      case DimensionUnit.FEET:
        return 304.8;
      default:
        throw new Error(`Unknown dimension unit: ${this.unit}`);
    }
  }

  // Calculated properties
  getVolume(): number {
    return this.length * this.width * this.height;
  }

  getVolumeInCubicCentimeters(): number {
    const cm = this.toCentimeters();
    return cm.length * cm.width * cm.height;
  }

  getVolumeInCubicMeters(): number {
    const m = this.toMeters();
    return m.length * m.width * m.height;
  }

  getSurfaceArea(): number {
    return (
      2 *
      (this.length * this.width +
        this.width * this.height +
        this.height * this.length)
    );
  }

  getLongestSide(): number {
    return Math.max(this.length, this.width, this.height);
  }

  getShortestSide(): number {
    return Math.min(this.length, this.width, this.height);
  }

  // Orientation methods
  isSquare(): boolean {
    const tolerance = 0.001;
    return Math.abs(this.length - this.width) < tolerance;
  }

  isCube(): boolean {
    const tolerance = 0.001;
    return (
      Math.abs(this.length - this.width) < tolerance &&
      Math.abs(this.width - this.height) < tolerance
    );
  }

  isFlat(): boolean {
    // Consider flat if one dimension is significantly smaller than the others
    const longest = this.getLongestSide();
    const shortest = this.getShortestSide();
    return shortest / longest < 0.1;
  }

  // Business logic methods
  isCompact(): boolean {
    // Consider compact if all dimensions are under 30cm
    const cm = this.toCentimeters();
    return cm.length <= 30 && cm.width <= 30 && cm.height <= 30;
  }

  isBulky(): boolean {
    // Consider bulky if any dimension is over 1 meter
    const m = this.toMeters();
    return m.length > 1 || m.width > 1 || m.height > 1;
  }

  getShippingCategory(): string {
    const volumeCm3 = this.getVolumeInCubicCentimeters();
    const longestSideCm = this.convertTo(
      DimensionUnit.CENTIMETERS,
    ).getLongestSide();

    if (volumeCm3 <= 1000 && longestSideCm <= 20) return 'Small Package';
    if (volumeCm3 <= 8000 && longestSideCm <= 35) return 'Medium Package';
    if (volumeCm3 <= 27000 && longestSideCm <= 60) return 'Large Package';
    return 'Oversized Package';
  }

  fitsInBox(boxDimensions: ProductDimensions): boolean {
    // Get all dimensions in the same unit
    const thisCm = this.toCentimeters();
    const boxCm = boxDimensions.toCentimeters();

    // Sort dimensions to check if this can fit in any orientation
    const thisSorted = [thisCm.length, thisCm.width, thisCm.height].sort(
      (a, b) => a - b,
    );
    const boxSorted = [boxCm.length, boxCm.width, boxCm.height].sort(
      (a, b) => a - b,
    );

    return (
      thisSorted[0] <= boxSorted[0] &&
      thisSorted[1] <= boxSorted[1] &&
      thisSorted[2] <= boxSorted[2]
    );
  }

  // Display methods
  toDisplayString(): string {
    const rounded = {
      length: Math.round(this.length * 100) / 100,
      width: Math.round(this.width * 100) / 100,
      height: Math.round(this.height * 100) / 100,
    };
    return `${rounded.length} × ${rounded.width} × ${rounded.height} ${this.unit}`;
  }

  toDisplayStringOptimal(): string {
    // Display in the most appropriate unit
    const volumeCm3 = this.getVolumeInCubicCentimeters();

    if (volumeCm3 < 1000) {
      // Use millimeters for small items
      const mm = this.convertTo(DimensionUnit.MILLIMETERS);
      return mm.toDisplayString();
    } else if (volumeCm3 < 1000000) {
      // Use centimeters for medium items
      const cm = this.convertTo(DimensionUnit.CENTIMETERS);
      return cm.toDisplayString();
    } else {
      // Use meters for large items
      const m = this.convertTo(DimensionUnit.METERS);
      return m.toDisplayString();
    }
  }

  // Validation
  private validate(
    length: number,
    width: number,
    height: number,
    unit: DimensionUnit,
  ): void {
    this.validateDimension(length, 'length');
    this.validateDimension(width, 'width');
    this.validateDimension(height, 'height');

    if (!Object.values(DimensionUnit).includes(unit)) {
      throw new Error(`Invalid dimension unit: ${unit}`);
    }

    // Reasonable limits (convert to meters for validation)
    const maxDimensionInMeters = 100; // 100 meters max
    const meters = this.toMeters();

    if (
      meters.length > maxDimensionInMeters ||
      meters.width > maxDimensionInMeters ||
      meters.height > maxDimensionInMeters
    ) {
      throw new Error('Dimensions exceed maximum allowed values');
    }
  }

  private validateDimension(value: number, name: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${name} must be a valid number`);
    }

    if (value <= 0) {
      throw new Error(`${name} must be positive`);
    }

    if (!isFinite(value)) {
      throw new Error(`${name} must be finite`);
    }
  }

  toJSON(): object {
    return {
      length: this.length,
      width: this.width,
      height: this.height,
      unit: this.unit,
      volume: this.getVolume(),
      volumeCm3: this.getVolumeInCubicCentimeters(),
      surfaceArea: this.getSurfaceArea(),
      displayString: this.toDisplayString(),
      shippingCategory: this.getShippingCategory(),
    };
  }

  // Static factory methods
  static zero(): ProductDimensions {
    return new ProductDimensions(0.1, 0.1, 0.1, DimensionUnit.CENTIMETERS);
  }
}
