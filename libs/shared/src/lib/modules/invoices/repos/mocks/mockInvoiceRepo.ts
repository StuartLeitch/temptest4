import { cloneDeep } from 'lodash';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { InvoiceRepoContract } from '../invoiceRepo';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { TransactionId } from '../../../transactions/domain/TransactionId';

export class MockInvoiceRepo extends BaseMockRepo<Invoice>
  implements InvoiceRepoContract {
  constructor() {
    super();
  }

  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    const matches = this._items.filter((i) => i.invoiceId.equals(invoiceId));
    if (matches.length !== 0) {
      return cloneDeep(matches[0]);
    } else {
      return null;
    }
  }

  public async getFailedErpInvoices(): Promise<Invoice[]> {
    return [];
  }

  public async getInvoiceByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Invoice> {
    const match = this._items.find((i) =>
      i.invoiceItems
        .getItems()
        .some((ii) => ii.invoiceItemId.equals(invoiceItemId))
    );
    return match ? cloneDeep(match) : null;
  }

  public async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const matches = this._items.filter((i) =>
      i.transactionId.equals(transactionId)
    );
    if (matches.length !== 0) {
      return cloneDeep(matches);
    } else {
      return null;
    }
  }

  async getRecentInvoices(): Promise<any[]> {
    return cloneDeep(this._items);
  }

  public async getInvoiceCollection(): Promise<Invoice[]> {
    return cloneDeep(this._items); // .filter(i => i.invoiceId.id.toString() === invoiceId);
  }

  public async getInvoicePaymentInfo(
    invoiceId: InvoiceId
  ): Promise<InvoicePaymentInfo> {
    const invoice = this._items.find((item) => item.id.equals(invoiceId.id));
    if (!invoice) {
      return null;
    }
    return {
      invoiceId: invoiceId.id.toString(),
      transactionId: invoice.transactionId.id.toString(),
      invoiceStatus: invoice.status,
      invoiceNumber: invoice.invoiceNumber,
      invoiceIssueDate: invoice.dateIssued?.toISOString(),
      payerName: '',
      payerEmail: '',
      payerType: '',
      address: '',
      city: '',
      country: '',
      vatRegistrationNumber: '',
      foreignPaymentId: '',
      amount: null,
      paymentDate: invoice.props.dateUpdated?.toISOString(),
      paymentType: '',
    };
  }

  public async assignInvoiceNumber(invoiceId: InvoiceId): Promise<Invoice> {
    return null;
  }

  public async save(invoice: Invoice): Promise<Invoice> {
    const alreadyExists = await this.exists(invoice);

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, invoice)) {
          return invoice;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(invoice);
    }

    return cloneDeep(invoice);
  }

  public async update(invoice: Invoice): Promise<Invoice> {
    const alreadyExists = await this.exists(invoice);

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, invoice)) {
          return invoice;
        } else {
          return i;
        }
      });
    }

    return cloneDeep(invoice);
  }

  public async delete(invoice: Invoice): Promise<void> {
    this.removeMockItem(invoice);
  }

  public async exists(invoice: Invoice): Promise<boolean> {
    const found = this._items.filter((i) => this.compareMockItems(i, invoice));
    return found.length !== 0;
  }

  async existsWithId(id: InvoiceId): Promise<boolean> {
    const match = this._items.filter((i) => i.invoiceId.equals(id));

    return match.length !== 0;
  }

  public compareMockItems(a: Invoice, b: Invoice): boolean {
    return a.id.equals(b.id);
  }

  public async *getInvoicesIds(
    ids: string[],
    journalIds: string[]
  ): AsyncGenerator<string, void, undefined> {
    yield* this._items.map((item) => item.id.toString());
  }

  async getUnrecognizedErpInvoices(): Promise<InvoiceId[]> {
    return [];
  }

  async findByCancelledInvoiceReference(id: InvoiceId): Promise<Invoice> {
    const found = this._items.find(
      (item) => item.cancelledInvoiceReference === id.id.toString()
    );

    if (!found) {
      throw new Error(
        `No invoice with cancelled invoice reference ${id.id.toString()}`
      );
    }

    return found;
  }
}
