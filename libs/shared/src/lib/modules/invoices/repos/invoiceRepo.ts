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
  findByCancelledInvoiceReference(invoiceId: InvoiceId): Promise<Invoice>;
  getFailedSageErpInvoices(): Promise<Invoice[]>;
  getFailedNetsuiteErpInvoices(): Promise<Invoice[]>;
  getUnrecognizedSageErpInvoices(): Promise<InvoiceId[]>;
  getUnrecognizedNetsuiteErpInvoices(): Promise<InvoiceId[]>;
  getInvoicePaymentInfo(invoiceId: InvoiceId): Promise<InvoicePaymentInfo>;
  assignInvoiceNumber(invoiceId: InvoiceId): Promise<Invoice>;
  delete(invoice: Invoice): Promise<void>;
  restore(invoice: Invoice): Promise<void>;
  update(invoice: Invoice): Promise<Invoice>;
  existsWithId(id: InvoiceId): Promise<boolean>;
  getInvoicesIds(
    ids: string[],
    journalIds: string[],
    omitDeleted: boolean
  ): AsyncGenerator<string, void, undefined>;
  filterByInvoiceId?(invoiceId: InvoiceId): unknown;
  getInvoicesByCustomId?(customId: string): Promise<any[]>;
  isInvoiceDeleted(id: InvoiceId): Promise<boolean>;
}
