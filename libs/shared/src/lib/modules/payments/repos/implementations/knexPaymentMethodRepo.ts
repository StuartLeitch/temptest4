import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';

import { PaymentMethodMap } from './../../mapper/PaymentMethod';
import { PaymentMethodRepoContract } from './../paymentMethodRepo';
import { PaymentMethodId } from './../../domain/PaymentMethodId';
import { PaymentMethod } from './../../domain/PaymentMethod';

export class KnexPaymentMethodRepo
  extends AbstractBaseDBRepo<Knex, PaymentMethod>
  implements PaymentMethodRepoContract {
  async getPaymentMethodById(
    paymentMethodId: PaymentMethodId
  ): Promise<PaymentMethod> {
    const { db } = this;

    const paymentMethodRow = await db(TABLES.PAYMENT_METHODS)
      .select()
      .where('id', paymentMethodId.id.toString())
      .first();

    if (!paymentMethodRow) {
      throw RepoError.createEntityNotFoundError(
        'payment-method',
        paymentMethodId.id.toString()
      );
    }

    return PaymentMethodMap.toDomain(paymentMethodRow);
  }

  async save(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    const { db } = this;

    try {
      await db(TABLES.PAYMENT_METHODS).insert(
        PaymentMethodMap.toPersistence(paymentMethod)
      );
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getPaymentMethodById(paymentMethod.paymentMethodId);
  }

  async getPaymentMethods() {
    const { db } = this;

    try {
      return db(TABLES.PAYMENT_METHODS).select();
    } catch (e) {
      throw RepoError.fromDBError(e);
    }
  }

  async getPaymentMethodCollection(): Promise<PaymentMethod[]> {
    const { db } = this;
    let paymentMethods: any[];

    try {
      paymentMethods = await db(TABLES.PAYMENT_METHODS).select();
      if (!paymentMethods) {
        throw new Error('No payment methods available!');
      }
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return paymentMethods.map(paymentMethod =>
      PaymentMethodMap.toDomain(paymentMethod)
    );
  }

  async exists(paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      await this.getPaymentMethodById(paymentMethod.paymentMethodId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }
}
