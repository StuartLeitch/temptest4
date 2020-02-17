import { Repo } from '../../../infrastructure/Repo';
import { Invoice } from '../domain/Invoice';
import { InvoiceId } from '../domain/InvoiceId';
import { InvoiceItemId } from '../domain/InvoiceItemId';
import { TransactionId } from '../../transactions/domain/TransactionId';
import { InvoicePaymentInfo } from '../domain/InvoicePaymentInfo';

export interface InvoiceRepoContract extends Repo<Invoice> {
  getRecentInvoices(args?: any): Promise<any>;
  getInvoiceById(invoiceId: InvoiceId): Promise<Invoice>;
  getInvoiceByInvoiceItemId(invoiceItemId: InvoiceItemId): Promise<Invoice>;
  getInvoicesByTransactionId(transactionId: TransactionId): Promise<Invoice[]>;
  getFailedErpInvoices(): Promise<Invoice[]>;
  getInvoicePaymentInfo(invoiceId: InvoiceId): Promise<InvoicePaymentInfo>;
  assignInvoiceNumber(invoiceId: InvoiceId): Promise<Invoice>;
  delete(invoice: Invoice): Promise<unknown>;
  update(invoice: Invoice): Promise<Invoice>;
  getInvoicesIds(
    ids: string[],
    journalIds: string[],
    page: number
  ): Promise<string[]>;
}
