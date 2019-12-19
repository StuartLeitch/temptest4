export interface CreateCouponDTO {
  invoiceItemType: string;
  expirationDate: string;
  redeemCount: number;
  couponType: string;
  reduction: number;
  status: string;
  code: string;
  name: string;
}
