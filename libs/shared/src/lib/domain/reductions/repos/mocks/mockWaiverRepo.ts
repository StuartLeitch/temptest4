import {BaseMockRepo} from '../../../../core/tests/mocks/BaseMockRepo';

import {WaiverRepoContract} from '../waiverRepo';
import {Waiver} from '../../Waiver';
import {WaiverId} from '../../WaiverId';
import {InvoiceId} from '../../../../modules/invoices/domain/InvoiceId';
// import {TransactionId} from '../../../transactions/domain/TransactionId';

export class MockWaiverRepo extends BaseMockRepo<Waiver>
  implements WaiverRepoContract {
  constructor() {
    super();
  }

  public async getWaiverById(waiverId: WaiverId): Promise<Waiver> {
    const matches = this._items.filter(i => i.waiverId.equals(waiverId));
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  // public async getInvoiceByInvoiceItemId(
  //   invoiceItemId: InvoiceItemId
  // ): Promise<Invoice> {
  //   const match = this._items.find(i =>
  //     i.invoiceItems
  //       .getItems()
  //       .some(ii => ii.invoiceItemId.equals(invoiceItemId))
  //   );

  //   return match ? match : null;
  // }

  // public async getInvoicesByTransactionId(
  //   transactionId: TransactionId
  // ): Promise<Invoice[]> {
  //   const matches = this._items.filter(i =>
  //     i.transactionId.equals(transactionId)
  //   );
  //   if (matches.length !== 0) {
  //     return matches;
  //   } else {
  //     return null;
  //   }
  // }

  public async attachWaiverToInvoice(
    waiverId: WaiverId,
    invoiceId: InvoiceId
  ): Promise<void> {
    const [match] = this._items.filter(i => i.waiverId.equals(waiverId));
    if (!match) {
      return null;
    } else {
      // TODO: Emulate mocked association
      // return match;
    }
  }

  public async getWaiverCollection(): Promise<Waiver[]> {
    return this._items; // .filter(i => i.invoiceId.id.toString() === invoiceId);
  }

  public async save(waiver: Waiver): Promise<Waiver> {
    const alreadyExists = await this.exists(waiver);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, waiver)) {
          return waiver;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(waiver);
    }

    return waiver;
  }

  public async update(waiver: Waiver): Promise<Waiver> {
    const alreadyExists = await this.exists(waiver);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, waiver)) {
          return waiver;
        } else {
          return i;
        }
      });
    }

    return waiver;
  }

  public async delete(waiver: Waiver): Promise<void> {
    this.removeMockItem(waiver);
  }

  public async exists(waiver: Waiver): Promise<boolean> {
    const found = this._items.filter(i => this.compareMockItems(i, waiver));
    return found.length !== 0;
  }

  public compareMockItems(a: Waiver, b: Waiver): boolean {
    return a.id.equals(b.id);
  }
}
