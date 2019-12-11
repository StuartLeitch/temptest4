import { Repo } from '../../../infrastructure/Repo';
import { Invoice, InvoiceCollection } from '../domain/Invoice';
import { InvoiceId } from '../domain/InvoiceId';
import { InvoiceItemId } from '../domain/InvoiceItemId';
import { TransactionId } from '../../transactions/domain/TransactionId';
import { InvoicePaymentInfo } from '../domain/InvoicePaymentInfo';

interface Paginated {
  offset?: number;
  limit?: number;
}

export interface InvoiceRepoContract extends Repo<Invoice> {
  getRecentInvoices(paginated: Paginated): Promise<any>;
  getInvoiceById(invoiceId: InvoiceId): Promise<Invoice>;
  getInvoiceByInvoiceItemId(invoiceItemId: InvoiceItemId): Promise<Invoice>;
  getInvoicesByTransactionId(transactionId: TransactionId): Promise<Invoice[]>;
  getFailedErpInvoices(): Promise<Invoice[]>;
  getInvoicePaymentInfo(invoiceId: InvoiceId): Promise<InvoicePaymentInfo>;
  assignInvoiceNumber(invoiceId: InvoiceId): Promise<Invoice>;
  delete(invoice: Invoice): Promise<unknown>;
  update(invoice: Invoice): Promise<Invoice>;
}
