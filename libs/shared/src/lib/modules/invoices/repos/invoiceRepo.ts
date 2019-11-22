import { Repo } from '../../../infrastructure/Repo';
import { Invoice, InvoiceCollection } from '../domain/Invoice';
import { InvoiceId } from '../domain/InvoiceId';
import { InvoiceItemId } from '../domain/InvoiceItemId';
import { TransactionId } from '../../transactions/domain/TransactionId';

export interface InvoiceRepoContract extends Repo<Invoice> {
  getRecentInvoices(): Promise<any[]>;
  getInvoiceById(invoiceId: InvoiceId): Promise<Invoice>;
  getInvoiceByInvoiceItemId(invoiceItemId: InvoiceItemId): Promise<Invoice>;
  getInvoicesByTransactionId(transactionId: TransactionId): Promise<Invoice[]>;
  assignInvoiceNumber(invoiceId: InvoiceId): Promise<Invoice>;
  delete(invoice: Invoice): Promise<unknown>;
  update(invoice: Invoice): Promise<Invoice>;
}
