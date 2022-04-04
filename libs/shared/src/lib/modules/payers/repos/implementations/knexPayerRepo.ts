import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { TABLES } from '../../../../infrastructure/database/knex';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { PayerId } from '../../domain/PayerId';
import { Payer } from '../../domain/Payer';

import { PayerMap } from '../../mapper/Payer';

import { PayerRepoContract } from '../payerRepo';
import Knex from "knex";


export class KnexPayerRepo
  extends AbstractBaseDBRepo<Knex, Payer>
  implements PayerRepoContract {
  async getPayerById(
    payerId: PayerId
  ): Promise<Either<GuardFailure | RepoError, Payer>> {
    const { db } = this;

    const payerRow = await db(TABLES.PAYERS)
      .select()
      .where('id', payerId.id.toString())
      .first();

    if (!payerRow) {
      return left(
        RepoError.createEntityNotFoundError('payer', payerId.id.toString())
      );
    }

    return PayerMap.toDomain(payerRow);
  }

  async getPayerByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Payer>> {
    const { db } = this;
    const payerRow = await db(TABLES.PAYERS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();

    if (!payerRow) {
      return left(
        RepoError.createEntityNotFoundError('payer', invoiceId.id.toString())
      );
    }

    return PayerMap.toDomain(payerRow);
  }

  async update(payer: Payer): Promise<Either<GuardFailure | RepoError, Payer>> {
    const { db } = this;

    const updated = await db(TABLES.PAYERS)
      .where({ id: payer.payerId.id.toString() })
      .update(PayerMap.toPersistence(payer));

    if (!updated) {
      return left(
        RepoError.createEntityNotFoundError('payer', payer.id.toString())
      );
    }

    return this.getPayerById(payer.payerId);
  }

  async save(payer: Payer): Promise<Either<GuardFailure | RepoError, Payer>> {
    const { db } = this;

    try {
      await db(TABLES.PAYERS).insert(PayerMap.toPersistence(payer));

      return this.getPayerById(payer.payerId);
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
  }

  async exists(
    payer: Payer
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.getPayerById(payer.payerId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }

      return left(RepoError.fromDBError(e));
    }

    return right(true);
  }
}
