import { PaginationArguments } from './../../../core/domain/arguments/arguments';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { CouponAssignedCollection } from '../domain/CouponAssignedCollection';
import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
import { CouponCode } from '../domain/CouponCode';
import { CouponId } from '../domain/CouponId';
import { Coupon } from '../domain/Coupon';

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
  ): Promise<Either<GuardFailure | RepoError, PaginatedCouponsResult>>;
  getCouponCollection(): Promise<Either<GuardFailure | RepoError, Coupon[]>>;
  getCouponsByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, CouponAssignedCollection>>;
  getCouponById(couponId: CouponId): Promise<Either<GuardFailure | RepoError, Coupon>>;
  getCouponByCode(code: CouponCode): Promise<Either<GuardFailure | RepoError, Coupon>>;
  incrementRedeemedCount(coupon: Coupon): Promise<Either<GuardFailure | RepoError, Coupon>>;
  assignCouponToInvoiceItem(
    coupon: Coupon,
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, Coupon>>;
  update(coupon: Coupon): Promise<Either<GuardFailure | RepoError, Coupon>>;
  isCodeUsed(code: CouponCode | string): Promise<Either<GuardFailure | RepoError, boolean>>;
}
