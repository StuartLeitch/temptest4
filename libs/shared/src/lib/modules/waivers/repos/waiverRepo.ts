import { Repo } from '../../../infrastructure/Repo';
import { Waiver, WaiverType } from '../domain/Waiver';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
// import {InvoiceItemId} from '../domain/InvoiceItemId';
// import {TransactionId} from '../../transactions/domain/TransactionId';

export interface WaiverRepoContract extends Repo<Waiver> {
  getWaivers(): Promise<Waiver[]>;
  getWaiversByInvoiceId(invoiceId: InvoiceId): Promise<Waiver[]>;
  getWaiverByType(waiverType: WaiverType): Promise<Waiver>;
  attachWaiversToInvoice(
    waivers: WaiverType[],
    invoiceId: InvoiceId
  ): Promise<Waiver[]>;
}
