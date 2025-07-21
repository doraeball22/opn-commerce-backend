export enum WeightUnit {
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  POUNDS = 'lb',
  OUNCES = 'oz',
}

export class ProductWeight {
  private constructor(
    private readonly value: number,
    private readonly unit: WeightUnit,
  ) {
    this.validate(value, unit);
  }

  static create(
    value: number,
    unit: WeightUnit = WeightUnit.GRAMS,
  ): ProductWeight {
    return new ProductWeight(value, unit);
  }

  static fromString(weightString: string): ProductWeight {
    const match = weightString
      .trim()
      .match(/^(\d+(?:\.\d+)?)\s*(g|kg|lb|oz)$/i);
    if (!match) {
      throw new Error(
        'Invalid weight format. Expected format: "100 g", "1.5 kg", etc.',
      );
    }

    const value = parseFloat(match[1]);
    const unitString = match[2].toLowerCase();

    let unit: WeightUnit;
    switch (unitString) {
      case 'g':
        unit = WeightUnit.GRAMS;
        break;
      case 'kg':
        unit = WeightUnit.KILOGRAMS;
        break;
      case 'lb':
        unit = WeightUnit.POUNDS;
        break;
      case 'oz':
        unit = WeightUnit.OUNCES;
        break;
      default:
        throw new Error(`Unsupported weight unit: ${unitString}`);
    }

    return new ProductWeight(value, unit);
  }

  getValue(): number {
    return this.value;
  }

  getUnit(): WeightUnit {
    return this.unit;
  }

  toString(): string {
    return `${this.value} ${this.unit}`;
  }

  equals(other: ProductWeight): boolean {
    // Convert both to grams for comparison
    return this.toGrams() === other.toGrams();
  }

  // Conversion methods
  toGrams(): number {
    switch (this.unit) {
      case WeightUnit.GRAMS:
        return this.value;
      case WeightUnit.KILOGRAMS:
        return this.value * 1000;
      case WeightUnit.POUNDS:
        return this.value * 453.592;
      case WeightUnit.OUNCES:
        return this.value * 28.3495;
      default:
        throw new Error(`Unknown weight unit: ${this.unit}`);
    }
  }

  toKilograms(): number {
    return this.toGrams() / 1000;
  }

  toPounds(): number {
    return this.toGrams() / 453.592;
  }

  toOunces(): number {
    return this.toGrams() / 28.3495;
  }

  convertTo(targetUnit: WeightUnit): ProductWeight {
    if (this.unit === targetUnit) {
      return this;
    }

    const grams = this.toGrams();
    let targetValue: number;

    switch (targetUnit) {
      case WeightUnit.GRAMS:
        targetValue = grams;
        break;
      case WeightUnit.KILOGRAMS:
        targetValue = grams / 1000;
        break;
      case WeightUnit.POUNDS:
        targetValue = grams / 453.592;
        break;
      case WeightUnit.OUNCES:
        targetValue = grams / 28.3495;
        break;
      default:
        throw new Error(`Unknown target weight unit: ${targetUnit}`);
    }

    // Round to 3 decimal places
    targetValue = Math.round(targetValue * 1000) / 1000;

    return new ProductWeight(targetValue, targetUnit);
  }

  // Comparison methods
  isGreaterThan(other: ProductWeight): boolean {
    return this.toGrams() > other.toGrams();
  }

  isLessThan(other: ProductWeight): boolean {
    return this.toGrams() < other.toGrams();
  }

  isGreaterThanOrEqual(other: ProductWeight): boolean {
    return this.toGrams() >= other.toGrams();
  }

  isLessThanOrEqual(other: ProductWeight): boolean {
    return this.toGrams() <= other.toGrams();
  }

  // Arithmetic operations (returns weight in the same unit as the first operand)
  add(other: ProductWeight): ProductWeight {
    const thisInGrams = this.toGrams();
    const otherInGrams = other.toGrams();
    const resultInGrams = thisInGrams + otherInGrams;

    return ProductWeight.create(resultInGrams, WeightUnit.GRAMS).convertTo(
      this.unit,
    );
  }

  subtract(other: ProductWeight): ProductWeight {
    const thisInGrams = this.toGrams();
    const otherInGrams = other.toGrams();
    const resultInGrams = thisInGrams - otherInGrams;

    if (resultInGrams < 0) {
      throw new Error('Weight cannot be negative after subtraction');
    }

    return ProductWeight.create(resultInGrams, WeightUnit.GRAMS).convertTo(
      this.unit,
    );
  }

  multiply(factor: number): ProductWeight {
    if (factor < 0) {
      throw new Error('Cannot multiply weight by negative factor');
    }

    return new ProductWeight(this.value * factor, this.unit);
  }

  divide(divisor: number): ProductWeight {
    if (divisor <= 0) {
      throw new Error('Cannot divide weight by zero or negative number');
    }

    return new ProductWeight(this.value / divisor, this.unit);
  }

  // Business logic methods
  isLightweight(): boolean {
    // Consider anything under 500g as lightweight
    return this.toGrams() < 500;
  }

  isHeavy(): boolean {
    // Consider anything over 5kg as heavy
    return this.toKilograms() > 5;
  }

  getShippingCategory(): string {
    const grams = this.toGrams();

    if (grams <= 100) return 'Letter';
    if (grams <= 500) return 'Small Package';
    if (grams <= 2000) return 'Standard Package';
    if (grams <= 10000) return 'Large Package';
    return 'Heavy Package';
  }

  // Display methods
  toDisplayString(): string {
    const rounded = Math.round(this.value * 100) / 100;
    return `${rounded} ${this.unit}`;
  }

  toDisplayStringOptimal(): string {
    // Display in the most appropriate unit
    const grams = this.toGrams();

    if (grams >= 1000) {
      const kg = grams / 1000;
      return `${Math.round(kg * 100) / 100} kg`;
    } else {
      return `${Math.round(grams * 10) / 10} g`;
    }
  }

  // Validation
  private validate(value: number, unit: WeightUnit): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Weight value must be a valid number');
    }

    if (value < 0) {
      throw new Error('Weight cannot be negative');
    }

    if (!isFinite(value)) {
      throw new Error('Weight must be finite');
    }

    if (!Object.values(WeightUnit).includes(unit)) {
      throw new Error(`Invalid weight unit: ${unit}`);
    }

    // Reasonable limits
    const maxWeightInGrams = 1000000; // 1000 kg max
    if (this.toGrams() > maxWeightInGrams) {
      throw new Error('Weight exceeds maximum allowed value');
    }
  }

  toJSON(): object {
    return {
      value: this.value,
      unit: this.unit,
      grams: this.toGrams(),
      displayString: this.toDisplayString(),
      shippingCategory: this.getShippingCategory(),
    };
  }

  // Static factory methods
  static zero(): ProductWeight {
    return new ProductWeight(0, WeightUnit.GRAMS);
  }

  static min(weight1: ProductWeight, weight2: ProductWeight): ProductWeight {
    return weight1.isLessThan(weight2) ? weight1 : weight2;
  }

  static max(weight1: ProductWeight, weight2: ProductWeight): ProductWeight {
    return weight1.isGreaterThan(weight2) ? weight1 : weight2;
  }
}
