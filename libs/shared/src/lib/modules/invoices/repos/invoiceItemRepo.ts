import {Repo} from '../../../infrastructure/Repo';
import {InvoiceItem} from '../domain/InvoiceItem';
import {InvoiceItemId} from '../domain/InvoiceItemId';
// import {TransactionId} from '../../transactions/domain/TransactionId';

export interface InvoiceItemRepoContract extends Repo<InvoiceItem> {
  getInvoiceItemById(invoiceItemId: InvoiceItemId): Promise<InvoiceItem>;
  // getInvoicesByTransactionId(transactionId: TransactionId): Promise<Invoice[]>;
  // delete(invoice: Invoice): Promise<unknown>;
  // update(invoice: Invoice): Promise<Invoice>;
}
