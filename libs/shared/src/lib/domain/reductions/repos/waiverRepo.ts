import {Repo} from '../../../infrastructure/Repo';
import {Waiver} from '../Waiver';
import {WaiverId} from '../WaiverId';
import {InvoiceId} from '../../../modules//invoices/domain/InvoiceId';
// import {InvoiceItemId} from '../domain/InvoiceItemId';
// import {TransactionId} from '../../transactions/domain/TransactionId';

export interface WaiverRepoContract extends Repo<Waiver> {
  getWaiverById(waiverId: WaiverId): Promise<Waiver>;
  // getWaiverByInvoiceId(invoiceItemId: InvoiceItemId): Promise<Invoice>;
  // getInvoicesByTransactionId(transactionId: TransactionId): Promise<Invoice[]>;
  // delete(invoice: Invoice): Promise<unknown>;
  // update(invoice: Invoice): Promise<Invoice>;
  attachWaiverToInvoice(
    waiverId: WaiverId,
    invoiceId: InvoiceId
  ): Promise<void>;
}
