import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Payer } from '../../domain/Payer';
import { PayerId } from '../../domain/PayerId';
import { PayerMap } from '../../mapper/Payer';
import { PayerRepoContract } from '../payerRepo';

export class KnexPayerRepo extends AbstractBaseDBRepo<Knex, Payer>
  implements PayerRepoContract {
  async getPayerById(payerId: PayerId): Promise<Payer> {
    const { db } = this;

    const payerRow = await db(TABLES.PAYERS)
      .select()
      .where('id', payerId.id.toString())
      .first();

    if (!payerRow) {
      throw RepoError.createEntityNotFoundError('payer', payerId.id.toString());
    }

    return PayerMap.toDomain(payerRow);
  }

  async getPayerByInvoiceId(invoiceId: InvoiceId): Promise<Payer> {
    const { db } = this;
    const payerRow = await db(TABLES.PAYERS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();

    if (!payerRow) {
      // throw RepoError.createEntityNotFoundError(
      //   'payer',
      //   invoiceId.id.toString()
      // );
      return null;
    }

    return PayerMap.toDomain(payerRow);
  }

  async update(payer: Payer): Promise<Payer> {
    const { db } = this;

    const updated = await db(TABLES.PAYERS)
      .where({ id: payer.payerId.id.toString() })
      .update(PayerMap.toPersistence(payer));

    if (!updated) {
      throw RepoError.createEntityNotFoundError('payer', payer.id.toString());
    }

    return payer;
  }

  async save(payer: Payer): Promise<Payer> {
    const { db } = this;

    await db(TABLES.PAYERS).insert(PayerMap.toPersistence(payer));

    return await this.getPayerById(payer.payerId);
  }

  async exists(payer: Payer): Promise<boolean> {
    try {
      await this.getPayerById(payer.payerId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }

  getCollection(params?: string[]): Promise<Payer[]> {
    return Promise.resolve([]);
  }
}
