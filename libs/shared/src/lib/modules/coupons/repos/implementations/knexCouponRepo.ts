import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { RepoError } from '../../../../infrastructure/RepoError';

import { CouponAssignedCollection } from '../../domain/CouponAssignedCollection';
import { InvoiceItemId } from './../../../invoices/domain/InvoiceItemId';
import { CouponCode } from '../../domain/CouponCode';
import { CouponId } from '../../domain/CouponId';
import { Coupon } from '../../domain/Coupon';

import { CouponMap } from '../../mappers/CouponMap';

import {
  GetRecentCouponsArguments,
  PaginatedCouponsResult,
  CouponRepoContract,
} from '../couponRepo';

export class KnexCouponRepo
  extends AbstractBaseDBRepo<Knex, Coupon>
  implements CouponRepoContract {
  async getCouponsByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, CouponAssignedCollection>> {
    const { db } = this;

    const coupons = await db
      .select(
        `${TABLES.INVOICE_ITEMS_TO_COUPONS}.dateCreated as dateAssigned`,
        `${TABLES.INVOICE_ITEMS_TO_COUPONS}.invoiceItemId`,
        `${TABLES.COUPONS}.invoiceItemType`,
        `${TABLES.COUPONS}.expirationDate`,
        `${TABLES.COUPONS}.dateCreated`,
        `${TABLES.COUPONS}.dateUpdated`,
        `${TABLES.COUPONS}.redeemCount`,
        `${TABLES.COUPONS}.reduction`,
        `${TABLES.COUPONS}.status`,
        `${TABLES.COUPONS}.code`,
        `${TABLES.COUPONS}.name`,
        `${TABLES.COUPONS}.type`,
        `${TABLES.COUPONS}.id`
      )
      .from(TABLES.INVOICE_ITEMS_TO_COUPONS)
      .where('invoiceItemId', invoiceItemId.id.toString())
      .join(
        TABLES.COUPONS,
        `${TABLES.INVOICE_ITEMS_TO_COUPONS}.couponId`,
        '=',
        `${TABLES.COUPONS}.id`
      );

    return CouponMap.toDomainCollection(coupons);
  }

  async getCouponByCode(
    code: CouponCode
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const { db } = this;
    const coupon = await db
      .select()
      .from(TABLES.COUPONS)
      .where('code', code.value)
      .first();

    if (!coupon) {
      return left(
        RepoError.createEntityNotFoundError('coupon by code', code.toString())
      );
    }

    return CouponMap.toDomain(coupon);
  }

  async assignCouponToInvoiceItem(
    coupon: Coupon,
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const { db } = this;
    await db(TABLES.INVOICE_ITEMS_TO_COUPONS).insert({
      invoiceItemId: invoiceItemId.id.toString(),
      couponId: coupon.id.toString(),
      dateCreated: new Date(),
    });
    return this.incrementRedeemedCount(coupon);
  }

  async incrementRedeemedCount(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const { db } = this;
    const updatedCoupon = await db(TABLES.COUPONS)
      .increment('redeemCount')
      .where('id', coupon.id.toString());
    if (!updatedCoupon) {
      return left(
        RepoError.createEntityNotFoundError('coupon', coupon.id.toString())
      );
    }
    return this.getCouponById(coupon.couponId);
  }

  async update(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const { db } = this;

    const updateObject = {
      ...CouponMap.toPersistence(coupon),
    };

    const updated = await db(TABLES.COUPONS)
      .where({ id: coupon.id.toString() })
      .update(updateObject);

    if (!updated) {
      return left(
        RepoError.createEntityNotFoundError('coupon', coupon.id.toString())
      );
    }

    return this.getCouponById(coupon.couponId);
  }

  async getCouponById(
    couponId: CouponId
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const { db } = this;

    const couponRow = await db(TABLES.COUPONS)
      .select()
      .where('id', couponId.id.toString())
      .first();

    return CouponMap.toDomain(couponRow);
  }

  async getCouponCollection(): Promise<
    Either<GuardFailure | RepoError, Coupon[]>
  > {
    const { db } = this;

    const couponsRows: Array<any> = await db(TABLES.COUPONS);

    return flatten(couponsRows.map(CouponMap.toDomain));
  }

  async getRecentCoupons(
    args?: GetRecentCouponsArguments
  ): Promise<Either<GuardFailure | RepoError, PaginatedCouponsResult>> {
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

    return flatten(coupons.map(CouponMap.toDomain)).map((coupons) => ({
      totalCount,
      coupons,
    }));
  }

  async exists(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const result = await this.getCouponById(coupon.couponId);

    return right(!!result);
  }

  async save(
    coupon: Coupon
  ): Promise<Either<GuardFailure | RepoError, Coupon>> {
    const { db } = this;
    const data = CouponMap.toPersistence(coupon);

    await db(TABLES.COUPONS).insert(data);

    return this.getCouponById(coupon.couponId);
  }

  async isCodeUsed(
    code: CouponCode | string
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const rawValue = code instanceof CouponCode ? code.value : code;
    const { db } = this;
    const result = await db(TABLES.COUPONS)
      .select('code')
      .where('code', rawValue);

    return right(!!result.length);
  }
}
