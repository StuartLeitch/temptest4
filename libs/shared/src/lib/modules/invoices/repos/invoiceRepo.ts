import {Repo} from '../../../infrastructure/Repo';
import {Invoice} from '../domain/Invoice';
import {InvoiceId} from '../domain/InvoiceId';
import {TransactionId} from '../../transactions/domain/TransactionId';

export interface InvoiceRepoContract extends Repo<Invoice> {
  getInvoiceById(invoiceId: InvoiceId): Promise<Invoice>;
  getInvoicesByTransactionId(transactionId: TransactionId): Promise<Invoice[]>;
  delete(invoice: Invoice): Promise<unknown>;
  update(invoice: Invoice): Promise<Invoice>;
}
