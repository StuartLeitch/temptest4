import { PaginationArguments } from './../../../core/domain/arguments/arguments';
import { Repo } from '../../../infrastructure/Repo';

import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
import { CouponCode } from '../domain/CouponCode';
import { CouponId } from '../domain/CouponId';
import { Coupon } from '../domain/Coupon';
import { CouponAssignedCollection } from '../domain/CouponAssignedCollection';

export interface GetRecentCouponsArguments {
  pagination?: PaginationArguments;
  // filters: FiltersArguments;
}

export interface PaginatedCouponsResult {
  totalCount: number | string;
  coupons: Coupon[];
}

export interface CouponRepoContract extends Repo<Coupon> {
  getRecentCoupons(
    args?: GetRecentCouponsArguments
  ): Promise<PaginatedCouponsResult>;
  getCouponCollection(): Promise<Coupon[]>;
  getCouponsByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<CouponAssignedCollection>;
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
