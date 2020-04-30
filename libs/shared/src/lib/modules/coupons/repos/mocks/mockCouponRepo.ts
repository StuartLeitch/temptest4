import { GetRecentCouponsSuccessResponse } from './../../usecases/getRecentCoupons/getRecentCouponsResponse';
import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { InvoiceItemId } from '../../../invoices/domain/InvoiceItemId';
import { CouponCode } from '../../domain/CouponCode';
import { CouponRepoContract } from '../couponRepo';
import { CouponId } from '../../domain/CouponId';
import { Coupon } from '../../domain/Coupon';

export class MockCouponRepo extends BaseMockRepo<Coupon>
  implements CouponRepoContract {
  private invoiceItemToCouponMapper: {
    [key: string]: string[];
  } = {};

  constructor() {
    super();
  }

  async getCouponCollection(): Promise<Coupon[]> {
    return this._items;
  }

  async getRecentCoupons(): Promise<GetRecentCouponsSuccessResponse> {
    return {
      totalCount: this._items.length,
      coupons: this._items,
    };
  }

  addMockCouponToInvoiceItem(coupon: Coupon, invoiceItemId: InvoiceItemId) {
    const invoiceIdValue = invoiceItemId.id.toString();
    if (!this.invoiceItemToCouponMapper[invoiceIdValue]) {
      this.invoiceItemToCouponMapper[invoiceIdValue] = [];
    }

    this.invoiceItemToCouponMapper[invoiceIdValue].push(coupon.id.toString());
    this._items.push(coupon);
  }

  async getCouponsByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Coupon[]> {
    const couponIds = this.invoiceItemToCouponMapper[
      invoiceItemId.id.toString()
    ];
    if (!couponIds) {
      return [];
    }
    return this._items.filter((item) => couponIds.includes(item.id.toString()));
  }

  async getCouponById(couponId: CouponId): Promise<Coupon> {
    const match = this._items.find((item) => item.couponId.equals(couponId));
    return match ? match : null;
  }

  async getCouponByCode(code: CouponCode): Promise<Coupon> {
    const match = this._items.find((item) => item.code.equals(code));
    return match || null;
  }

  async incrementRedeemedCount(coupon: Coupon): Promise<Coupon> {
    const match = this._items.find((item) => item.id.equals(coupon.id));
    if (!match) {
      throw Error('not existing');
    }
    return match;
  }

  async assignCouponToInvoiceItem(
    coupon: Coupon,
    invoiceItemId: InvoiceItemId
  ): Promise<Coupon> {
    return coupon;
  }

  async update(coupon: Coupon): Promise<Coupon> {
    const alreadyExists = await this.exists(coupon);

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, coupon)) {
          return coupon;
        } else {
          return i;
        }
      });
    }

    return coupon;
  }

  public async save(coupon: Coupon): Promise<Coupon> {
    if (this.exists(coupon)) {
      throw Error('duplicate coupon');
    }

    this._items.push(coupon);
    return coupon;
  }

  async isCodeUsed(code: CouponCode | string): Promise<boolean> {
    const val = typeof code === 'string' ? code : code.value;
    return !this._items.some((item) => item.code.value === val);
  }

  public async exists(coupon: Coupon): Promise<boolean> {
    const found = this._items.filter((i) => this.compareMockItems(i, coupon));
    return found.length !== 0;
  }

  public compareMockItems(a: Coupon, b: Coupon): boolean {
    return a.id.equals(b.id);
  }
}
