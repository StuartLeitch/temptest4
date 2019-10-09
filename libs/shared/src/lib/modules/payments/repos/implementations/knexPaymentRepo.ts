import {
  Payment,
  PaymentId,
  PaymentRepoContract,
  PaymentMap,
  Knex
} from '../../../../..';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError, RepoErrorCode} from '../../../../infrastructure/RepoError';

export class KnexPaymentRepo extends AbstractBaseDBRepo<Knex, Payment>
  implements PaymentRepoContract {
  async getPaymentById(paymentId: PaymentId): Promise<Payment> {
    const {db} = this;

    const paymentRow = await db('payments')
      .select()
      .where('id', paymentId.id.toString())
      .first();

    if (!paymentRow) {
      throw RepoError.createEntityNotFoundError(
        'payment',
        paymentId.id.toString()
      );
    }

    return PaymentMap.toDomain(paymentRow);
  }

  async save(payment: Payment): Promise<Payment> {
    const {db} = this;

    try {
      await db('payments').insert(PaymentMap.toPersistence(payment));
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return await this.getPaymentById(payment.paymentId);
  }

  async exists(payment: Payment): Promise<boolean> {
    try {
      await this.getPaymentById(payment.paymentId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }
}
