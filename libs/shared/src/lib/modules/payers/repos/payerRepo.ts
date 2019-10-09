import {Repo} from '../../../infrastructure/Repo';

import {Payer} from '../domain/Payer';
import {PayerId} from '../domain/PayerId';
// import {TransactionId} from '../../../transactions/domain/TransactionId';

export interface PayerRepoContract extends Repo<Payer> {
  getPayerById(payerId: PayerId): Promise<Payer>;
  update(payer: Payer): Promise<Payer>;
  getCollection(params?: string[]): Promise<Payer[]>;
}
