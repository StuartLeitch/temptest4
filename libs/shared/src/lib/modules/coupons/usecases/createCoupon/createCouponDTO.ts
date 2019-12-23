export interface CreateCouponDTO {
  invoiceItemType: string;
  expirationDate?: string;
  couponType: string;
  reduction: number;
  status: string;
  code?: string;
  name: string;
}
