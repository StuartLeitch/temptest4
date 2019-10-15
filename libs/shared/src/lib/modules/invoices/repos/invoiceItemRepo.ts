import {Repo} from '../../../infrastructure/Repo';
import {InvoiceItem} from '../domain/InvoiceItem';
import {InvoiceItemId} from '../domain/InvoiceItemId';
import {ManuscriptId} from '../domain/ManuscriptId';

export interface InvoiceItemRepoContract extends Repo<InvoiceItem> {
  getInvoiceItemById(invoiceItemId: InvoiceItemId): Promise<InvoiceItem>;
  getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<InvoiceItem>;
  // getInvoicesByTransactionId(transactionId: TransactionId): Promise<Invoice[]>;
  delete(invoiceItem: InvoiceItem): Promise<void>;
  // update(invoice: Invoice): Promise<Invoice>;
}
