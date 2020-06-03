export interface CreateCouponDTO {
  invoiceItemType?: string;
  expirationDate?: string;
  type: string;
  reduction: number;
  status: string;
  code?: string;
  name: string;
}
