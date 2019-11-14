import {Knex, TABLES} from '@hindawi/shared';

import {Coupon} from '../../../../domain/reductions/Coupon';
import {CouponMap} from '../../mappers/CouponMap';
import {ReductionId} from '../../../../domain/reductions/ReductionId';

import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError} from '../../../../infrastructure/RepoError';
import {CouponRepoContract} from '../couponRepo';

export class KnexCouponRepo extends AbstractBaseDBRepo<Knex, Coupon>
  implements CouponRepoContract {
  async getCouponById(couponId: ReductionId): Promise<Coupon> {
    const {db} = this;

    const couponRow = await db(TABLES.COUPONS)
      .select()
      .where('id', couponId.id.toString())
      .first();

    return couponRow ? CouponMap.toDomain(couponRow) : null;
  }

  // getTransactionByManuscriptId(articleId: string): Promise<Transaction> {
  //   // TODO: Please read `docs/typescript/COMMANDMENTS.ts` to understand why `{} as Transaction` is a lie.
  //   return Promise.resolve({} as Transaction);
  // }

  async getCouponCollection(): Promise<Coupon[]> {
    const {db} = this;

    const couponsRows = await db(TABLES.COUPONS);

    return couponsRows.reduce((aggregator: any[], t) => {
      aggregator.push(CouponMap.toDomain(t));
      return aggregator;
    }, []);
  }

  // async delete(transaction: Transaction): Promise<unknown> {
  //   const {db} = this;

  //   const deletedRows = await db('transactions')
  //     .where('id', transaction.id.toString())
  //     .delete();

  //   return deletedRows
  //     ? deletedRows
  //     : Promise.reject(
  //         RepoError.createEntityNotFoundError(
  //           'transaction',
  //           transaction.id.toString()
  //         )
  //       );
  // }

  // async update(transaction: Transaction): Promise<Transaction> {
  //   const {db} = this;

  //   const updated = await db('transactions')
  //     .where({id: transaction.id.toString()})
  //     .update(TransactionMap.toPersistence(transaction));

  //   if (!updated) {
  //     throw RepoError.createEntityNotFoundError(
  //       'transaction',
  //       transaction.id.toString()
  //     );
  //   }

  //   return transaction;
  // }

  async exists(coupon: Coupon): Promise<boolean> {
    const result = await this.getCouponById(coupon.reductionId);

    return !!result;
  }

  async save(coupon: Coupon): Promise<Coupon> {
    const {db} = this;

    const data = CouponMap.toPersistence(coupon);

    await db(TABLES.COUPONS).insert(data);

    return this.getCouponById(coupon.reductionId);
  }
}
