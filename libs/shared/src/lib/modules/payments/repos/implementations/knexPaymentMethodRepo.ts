import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { PaymentMethodId } from './../../domain/PaymentMethodId';
import { PaymentMethod } from './../../domain/PaymentMethod';

import { PaymentMethodMap } from './../../mapper/PaymentMethod';

import { PaymentMethodRepoContract } from './../paymentMethodRepo';

export class KnexPaymentMethodRepo
  extends AbstractBaseDBRepo<Knex, PaymentMethod>
  implements PaymentMethodRepoContract {
  async getPaymentMethodById(
    paymentMethodId: PaymentMethodId
  ): Promise<Either<GuardFailure | RepoError, PaymentMethod>> {
    const { db } = this;

    const paymentMethodRow = await db(TABLES.PAYMENT_METHODS)
      .select()
      .where('id', paymentMethodId.id.toString())
      .first();

    if (!paymentMethodRow) {
      return left(
        RepoError.createEntityNotFoundError(
          'payment-method',
          paymentMethodId.id.toString()
        )
      );
    }

    return PaymentMethodMap.toDomain(paymentMethodRow);
  }

  async getPaymentMethodByName(
    paymentMethodName: string
  ): Promise<Either<GuardFailure | RepoError, PaymentMethod>> {
    const { db } = this;

    const paymentMethodRow = await db(TABLES.PAYMENT_METHODS)
      .select()
      .where('name', paymentMethodName)
      .first();

    if (!paymentMethodRow) {
      return left(
        RepoError.createEntityNotFoundError('payment-method', paymentMethodName)
      );
    }

    return PaymentMethodMap.toDomain(paymentMethodRow);
  }

  async save(
    paymentMethod: PaymentMethod
  ): Promise<Either<GuardFailure | RepoError, PaymentMethod>> {
    const { db } = this;

    try {
      await db(TABLES.PAYMENT_METHODS).insert(
        PaymentMethodMap.toPersistence(paymentMethod)
      );
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return this.getPaymentMethodById(paymentMethod.paymentMethodId);
  }

  async getPaymentMethods(): Promise<
    Either<GuardFailure | RepoError, PaymentMethod[]>
  > {
    const { db, logger } = this;

    const paymentMethodsSelect = db(TABLES.PAYMENT_METHODS).select();

    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    logger.debug('select', {
      correlationId,
      sql: paymentMethodsSelect.toString(),
    });

    try {
      const selection = await paymentMethodsSelect;
      return flatten(selection.map(PaymentMethodMap.toDomain));
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }
  }

  async getPaymentMethodCollection(): Promise<
    Either<GuardFailure | RepoError, PaymentMethod[]>
  > {
    const { db } = this;
    let paymentMethods: any[];

    try {
      paymentMethods = await db(TABLES.PAYMENT_METHODS).select();
      if (!paymentMethods) {
        return left(
          RepoError.createEntityNotFoundError('payment methods', null)
        );
      }
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return flatten(paymentMethods.map(PaymentMethodMap.toDomain));
  }

  async exists(
    paymentMethod: PaymentMethod
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.getPaymentMethodById(paymentMethod.paymentMethodId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }

      return left(RepoError.fromDBError(e));
    }

    return right(true);
  }
}
