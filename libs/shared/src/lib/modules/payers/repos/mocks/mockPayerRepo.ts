import {BaseMockRepo} from '../../../../core/tests/mocks/BaseMockRepo';

import {PayerRepoContract} from '../payerRepo';
import {Payer} from '../../domain/Payer';
import {PayerId} from '../../domain/PayerId';
// import {TransactionId} from '../../../transactions/domain/TransactionId';

export class MockPayerRepo extends BaseMockRepo<Payer>
  implements PayerRepoContract {
  constructor() {
    super();
  }

  public async getPayerById(payerId: PayerId): Promise<Payer> {
    const matches = this._items.filter(p => p.payerId.equals(payerId));
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getCollection() {
    return this._items;
  }

  public async update(payer: Payer): Promise<Payer> {
    const alreadyExists = await this.exists(payer);

    if (alreadyExists) {
      this._items.map(p => {
        if (this.compareMockItems(p, payer)) {
          return payer;
        } else {
          return p;
        }
      });
    }

    return payer;
  }

  public async save(payer: Payer): Promise<Payer> {
    const alreadyExists = await this.exists(payer);

    if (alreadyExists) {
      this._items.map(p => {
        if (this.compareMockItems(p, payer)) {
          return payer;
        } else {
          return p;
        }
      });
    } else {
      this._items.push(payer);
    }

    return payer;
  }

  public async delete(payer: Payer): Promise<boolean> {
    return true;
  }

  public async exists(payer: Payer): Promise<boolean> {
    const found = this._items.filter(p => this.compareMockItems(p, payer));
    return found.length !== 0;
  }

  public compareMockItems(a: Payer, b: Payer): boolean {
    return a.id.equals(b.id);
  }
}
