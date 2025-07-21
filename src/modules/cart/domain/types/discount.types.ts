export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export interface DiscountInfo {
  name: string;
  type: DiscountType;
  amount: number;
  maxAmount?: number;
}
