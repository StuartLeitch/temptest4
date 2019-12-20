import { Coupon } from '../../../domain/reductions/Coupon';
import { CouponId } from '../../../domain/reductions/CouponId';
import { Repo } from '../../../infrastructure/Repo';
import { CouponCode } from '../../../domain/reductions/CouponCode';
import { InvoiceItemId } from '@hindawi/shared';

export interface CouponRepoContract extends Repo<Coupon> {
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
