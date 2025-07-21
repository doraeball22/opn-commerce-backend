export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {
    this.validateAmount(amount);
    this.validateCurrency(currency);
  }

  static create(amount: number, currency: string = 'THB'): Money {
    return new Money(amount, currency);
  }

  static fromString(value: string, currency: string = 'THB'): Money {
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      throw new Error('Invalid money amount format');
    }
    return new Money(amount, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  // Math operations
  add(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.validateSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Money amount cannot be negative after subtraction');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Cannot multiply money by negative factor');
    }
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Cannot divide money by zero or negative number');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  // Comparison operations
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount < other.amount;
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount >= other.amount;
  }

  isLessThanOrEqual(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount <= other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  // Percentage operations
  percentage(percent: number): Money {
    return this.multiply(percent / 100);
  }

  addPercentage(percent: number): Money {
    return this.add(this.percentage(percent));
  }

  subtractPercentage(percent: number): Money {
    return this.subtract(this.percentage(percent));
  }

  // Formatting
  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  toDisplayString(): string {
    switch (this.currency) {
      case 'THB':
        return `฿${this.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'USD':
        return `$${this.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'EUR':
        return `€${this.amount.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default:
        return `${this.amount.toFixed(2)} ${this.currency}`;
    }
  }

  toJSON(): object {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  // Validation methods
  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Money amount must be a valid number');
    }

    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }

    if (!isFinite(amount)) {
      throw new Error('Money amount must be finite');
    }

    // Check for reasonable precision (2 decimal places for most currencies)
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new Error('Money amount cannot have more than 2 decimal places');
    }
  }

  private validateCurrency(currency: string): void {
    if (!currency || typeof currency !== 'string') {
      throw new Error('Currency must be a non-empty string');
    }

    if (currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code');
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error('Currency must be 3 uppercase letters');
    }

    // List of supported currencies
    const supportedCurrencies = ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'SGD'];
    if (!supportedCurrencies.includes(currency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
  }

  private validateSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`,
      );
    }
  }

  // Static factory methods for common operations
  static zero(currency: string = 'THB'): Money {
    return new Money(0, currency);
  }

  static min(money1: Money, money2: Money): Money {
    return money1.isLessThan(money2) ? money1 : money2;
  }

  static max(money1: Money, money2: Money): Money {
    return money1.isGreaterThan(money2) ? money1 : money2;
  }

  static sum(moneys: Money[]): Money {
    if (moneys.length === 0) {
      throw new Error('Cannot sum empty array of money');
    }

    const currency = moneys[0].currency;
    let total = Money.zero(currency);

    for (const money of moneys) {
      total = total.add(money);
    }

    return total;
  }
}
