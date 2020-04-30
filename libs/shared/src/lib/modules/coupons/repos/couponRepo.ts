import { PaginationArguments } from './../../../core/domain/arguments/arguments';
import { Coupon } from '../domain/Coupon';
import { CouponId } from '../domain/CouponId';
import { Repo } from '../../../infrastructure/Repo';
import { CouponCode } from '../domain/CouponCode';
import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';

export interface GetRecentCouponsArguments {
  pagination?: PaginationArguments;
  // filters: FiltersArguments;
}

export interface PaginatedCouponsResult {
  totalCount: number;
  coupons: Coupon[];
}

export interface CouponRepoContract extends Repo<Coupon> {
  getRecentCoupons(
    args?: GetRecentCouponsArguments
  ): Promise<PaginatedCouponsResult>;
  getCouponCollection(): Promise<Coupon[]>;
  getCouponsByInvoiceItemId(invoiceItemId: InvoiceItemId): Promise<Coupon[]>;
  getCouponById(couponId: CouponId): Promise<Coupon>;
  getCouponByCode(code: CouponCode): Promise<Coupon>;
  incrementRedeemedCount(coupon: Coupon): Promise<Coupon>;
  assignCouponToInvoiceItem(
    coupon: Coupon,
    invoiceItemId: InvoiceItemId
  ): Promise<Coupon>;
  update(coupon: Coupon): Promise<Coupon>;
  isCodeUsed(code: CouponCode | string): Promise<boolean>;
}
