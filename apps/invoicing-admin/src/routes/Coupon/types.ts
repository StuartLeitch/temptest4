export type CouponMode = 'EDIT' | 'VIEW' | 'CREATE' | 'CREATE_MULTIPLE';

export interface CouponType {
  name: string;
  type: string;
  code?: string;
  reduction: number;
  status: string;
  redeemCount?: number;
  dateCreated?: string;
  dateUpdated?: string;
  expirationDate: string;
}
