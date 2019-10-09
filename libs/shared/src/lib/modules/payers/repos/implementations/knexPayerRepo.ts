import {
  UniqueEntityID,
  Payer,
  PayerRepoContract,
  PayerId,
  PayerMap,
  Knex
} from '../../../..';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError, RepoErrorCode} from '../../../../infrastructure/RepoError';

export class KnexPayerRepo extends AbstractBaseDBRepo<Knex, Payer>
  implements PayerRepoContract {
  async getPayerById(payerId: PayerId): Promise<Payer> {
    const {db} = this;

    const payerRow = await db('payers')
      .select()
      .where('id', payerId.id.toString())
      .first();

    if (!payerRow) {
      throw RepoError.createEntityNotFoundError('payer', payerId.id.toString());
    }

    return PayerMap.toDomain(payerRow);
  }

  async update(payerId: PayerId): Promise<Payer> {
    return Promise.resolve({} as Payer);
  }

  async save(payer: Payer): Promise<Payer> {
    const {db} = this;

    await db('payers').insert(PayerMap.toPersistence(payer));

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
