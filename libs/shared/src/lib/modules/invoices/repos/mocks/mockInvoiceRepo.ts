import {BaseMockRepo} from '../../../../core/tests/mocks/BaseMockRepo';

import {InvoiceRepoContract} from '../invoiceRepo';
import {Invoice} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {TransactionId} from '../../../transactions/domain/TransactionId';

export class MockInvoiceRepo extends BaseMockRepo<Invoice>
  implements InvoiceRepoContract {
  constructor() {
    super();
  }

  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    const matches = this._items.filter(i => i.invoiceId.equals(invoiceId));
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const matches = this._items.filter(i =>
      i.transactionId.equals(transactionId)
    );
    if (matches.length !== 0) {
      return matches;
    } else {
      return null;
    }
  }

  public async getInvoiceCollection(): Promise<Invoice[]> {
    return this._items; // .filter(i => i.invoiceId.id.toString() === invoiceId);
  }

  public async save(invoice: Invoice): Promise<Invoice> {
    const alreadyExists = await this.exists(invoice);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, invoice)) {
          return invoice;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(invoice);
    }

    return invoice;
  }

  public async update(invoice: Invoice): Promise<Invoice> {
    const alreadyExists = await this.exists(invoice);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, invoice)) {
          return invoice;
        } else {
          return i;
        }
      });
    }

    return invoice;
  }

  public async delete(invoice: Invoice): Promise<boolean> {
    return true;
  }

  public async exists(invoice: Invoice): Promise<boolean> {
    const found = this._items.filter(i => this.compareMockItems(i, invoice));
    return found.length !== 0;
  }

  public compareMockItems(a: Invoice, b: Invoice): boolean {
    return a.id.equals(b.id);
  }
}
