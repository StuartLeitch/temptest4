import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { Coupon } from '../../domain/Coupon';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { CouponMap } from '../../mappers/CouponMap';
import {
  CouponRepoContract,
  PaginatedCouponsResult,
  GetRecentCouponsArguments,
} from '../couponRepo';
import { CouponId } from '../../domain/CouponId';
import { CouponCode } from '../../domain/CouponCode';
import { InvoiceItemId } from './../../../invoices/domain/InvoiceItemId';
import { RepoError } from '../../../../infrastructure/RepoError';

export class KnexCouponRepo extends AbstractBaseDBRepo<Knex, Coupon>
  implements CouponRepoContract {
  async getCouponsByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Coupon[]> {
    const { db } = this;

    const coupons = await db
      .select()
      .from(TABLES.INVOICE_ITEMS_TO_COUPONS)
      .where('invoiceItemId', invoiceItemId.id.toString())
      .join(
        TABLES.COUPONS,
        `${TABLES.INVOICE_ITEMS_TO_COUPONS}.couponId`,
        '=',
        `${TABLES.COUPONS}.id`
      );

    return coupons.map(CouponMap.toDomain);
  }

  async getCouponByCode(code: CouponCode): Promise<Coupon> {
    const { db } = this;

    const coupon = await db
      .select()
      .from(TABLES.COUPONS)
      .where('code', code.value)
      .first();
    return coupon ? CouponMap.toDomain(coupon) : null;
  }

  async assignCouponToInvoiceItem(
    coupon: Coupon,
    invoiceItemId: InvoiceItemId
  ): Promise<Coupon> {
    const { db } = this;
    await db(TABLES.INVOICE_ITEMS_TO_COUPONS).insert({
      invoiceItemId: invoiceItemId.id.toString(),
      couponId: coupon.id.toString(),
      dateCreated: new Date(),
    });
    return this.incrementRedeemedCount(coupon);
  }

  async incrementRedeemedCount(coupon: Coupon): Promise<Coupon> {
    const { db } = this;
    const updatedCoupon = await db(TABLES.COUPONS)
      .increment('redeemCount')
      .where('id', coupon.id.toString());
    if (!updatedCoupon) {
      RepoError.createEntityNotFoundError('coupon', coupon.id.toString());
    }
    return this.getCouponById(coupon.couponId);
  }

  async update(coupon: Coupon): Promise<Coupon> {
    const { db } = this;

    const updateObject = {
      ...CouponMap.toPersistence(coupon),
    };

    const updated = await db(TABLES.COUPONS)
      .where({ id: coupon.couponId.id.toString() })
      .update(updateObject);

    if (!updated) {
      throw RepoError.createEntityNotFoundError('coupon', coupon.id.toString());
    }

    return this.getCouponById(coupon.couponId);
  }

  async getCouponById(couponId: CouponId): Promise<Coupon> {
    const { db } = this;

    const couponRow = await db(TABLES.COUPONS)
      .select()
      .where('id', couponId.id.toString())
      .first();

    return couponRow ? CouponMap.toDomain(couponRow) : null;
  }

  async getCouponCollection(): Promise<Coupon[]> {
    const { db } = this;

    const couponsRows = await db(TABLES.COUPONS);

    return couponsRows.reduce((aggregator: any[], t) => {
      aggregator.push(CouponMap.toDomain(t));
      return aggregator;
    }, []);
  }

  async getRecentCoupons(
    args?: GetRecentCouponsArguments
  ): Promise<PaginatedCouponsResult> {
    const { pagination } = args;
    const { db } = this;

    const couponsCount = await db(TABLES.COUPONS).count(`${TABLES.COUPONS}.id`);
    const totalCount = couponsCount[0].count;

    const offset = pagination.offset * pagination.limit;

    const coupons = await db(TABLES.COUPONS) // applyFilters(getModel(), filters)
      .orderBy(`${TABLES.COUPONS}.dateCreated`, 'desc')
      .offset(offset < totalCount ? offset : 0)
      .limit(pagination.limit)
      .select([`${TABLES.COUPONS}.*`]);

    return {
      totalCount,
      coupons: coupons.map((c) => CouponMap.toDomain(c)),
    };
  }

  async exists(coupon: Coupon): Promise<boolean> {
    const result = await this.getCouponById(coupon.couponId);

    return !!result;
  }

  async save(coupon: Coupon): Promise<Coupon> {
    const { db } = this;
    const data = CouponMap.toPersistence(coupon);

    await db(TABLES.COUPONS).insert(data);

    return this.getCouponById(coupon.couponId);
  }

  async isCodeUsed(code: CouponCode | string): Promise<boolean> {
    const rawValue = code instanceof CouponCode ? code.value : code;
    const { db } = this;
    const result = await db(TABLES.COUPONS)
      .select('code')
      .where('code', rawValue);

    return !!result.length;
  }
}
