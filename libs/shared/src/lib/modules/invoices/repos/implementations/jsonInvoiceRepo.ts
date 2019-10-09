import {BaseJsonRepo} from '../../../../infrastructure/BaseJsonRepo';
import {InvoiceRepoContract} from '../invoiceRepo';
import {Invoice} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {TransactionId} from '../../../transactions/domain/TransactionId';
import {InvoiceMap} from '../../mappers/InvoiceMap';

export class InvoiceJsonRepo extends BaseJsonRepo<Invoice>
  implements InvoiceRepoContract {
  private db;

  constructor(db: any) {
    super();
    this.db = db;
  }

  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    return this.db
      .get('invoices')
      .find({id: invoiceId})
      .value();
  }

  public async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const rawInvoice = this.db
      .get('invoices')
      .find({transactionId: transactionId.id.toString()})
      .value();

    return rawInvoice ? [InvoiceMap.toDomain(rawInvoice)] : null;
  }

  public async getInvoiceCollection(
    articleId: string | string[]
  ): Promise<Invoice[]> {
    return this.db.get('invoices');
  }

  public async exists(invoice: Invoice): Promise<boolean> {
    const found = this._items.filter(i => this.compareJsonItems(i, invoice));
    return found.length !== 0;
  }

  public async save(invoice: Invoice): Promise<Invoice> {
    const rawInvoice = InvoiceMap.toPersistence(invoice);
    this.db
      .get('invoices')
      .push(rawInvoice)
      .write();
    return invoice;
  }

  public compareJsonItems(a: Invoice, b: Invoice): boolean {
    return a.id.equals(b.id);
  }
}
