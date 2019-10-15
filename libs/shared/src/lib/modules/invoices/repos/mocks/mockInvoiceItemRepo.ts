import {BaseMockRepo} from '../../../../core/tests/mocks/BaseMockRepo';

import {InvoiceItemRepoContract} from '../invoiceItemRepo';
import {InvoiceItem} from '../../domain/InvoiceItem';
import {InvoiceItemId} from '../../domain/InvoiceItemId';
import {ManuscriptId} from '../../domain/ManuscriptId';

export class MockInvoiceItemRepo extends BaseMockRepo<InvoiceItem>
  implements InvoiceItemRepoContract {
  constructor() {
    super();
  }

  public async getInvoiceItemById(
    invoiceItemId: InvoiceItemId
  ): Promise<InvoiceItem> {
    const matches = this._items.filter(i => i.invoiceId.equals(invoiceItemId));
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<InvoiceItem> {
    const match = this._items.find(i => i.manuscriptId.equals(manuscriptId));
    return match ? match : null;
  }

  public async getInvoiceItemCollection(): Promise<InvoiceItem[]> {
    return this._items;
  }

  public async save(invoiceItem: InvoiceItem): Promise<InvoiceItem> {
    const alreadyExists = await this.exists(invoiceItem);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, invoiceItem)) {
          return invoiceItem;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(invoiceItem);
    }

    return invoiceItem;
  }

  public async update(invoiceItem: InvoiceItem): Promise<InvoiceItem> {
    const alreadyExists = await this.exists(invoiceItem);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, invoiceItem)) {
          return invoiceItem;
        } else {
          return i;
        }
      });
    }

    return invoiceItem;
  }

  public async delete(invoiceItem: InvoiceItem): Promise<void> {
    this.removeMockItem(invoiceItem);
  }

  public async exists(invoiceItem: InvoiceItem): Promise<boolean> {
    const found = this._items.filter(i =>
      this.compareMockItems(i, invoiceItem)
    );
    return found.length !== 0;
  }

  public compareMockItems(a: InvoiceItem, b: InvoiceItem): boolean {
    return a.id.equals(b.id);
  }
}
