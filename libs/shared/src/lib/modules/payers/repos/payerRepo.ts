import {Repo} from '../../../infrastructure/Repo';

import {Payer} from '../domain/Payer';
import {PayerId} from '../domain/PayerId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
// import {TransactionId} from '../../../transactions/domain/TransactionId';

export interface PayerRepoContract extends Repo<Payer> {
  getPayerByInvoiceId(invoiceId: InvoiceId): Promise<Payer>
  getPayerById(payerId: PayerId): Promise<Payer>;
  update(payer: Payer): Promise<Payer>;
  getCollection(params?: string[]): Promise<Payer[]>;
}
