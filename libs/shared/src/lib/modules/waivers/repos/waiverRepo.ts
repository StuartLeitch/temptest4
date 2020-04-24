import { Repo } from '../../../infrastructure/Repo';
import { Waiver, WaiverType } from '../domain/Waiver';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
// import {InvoiceItemId} from '../domain/InvoiceItemId';
// import {TransactionId} from '../../transactions/domain/TransactionId';

export interface WaiverRepoContract extends Repo<Waiver> {
  getWaivers(): Promise<Waiver[]>;
  getWaiversByInvoiceId(invoiceId: InvoiceId): Promise<Waiver[]>;
  getWaiversByInvoiceItemId(invoiceItemId: InvoiceItemId): Promise<Waiver[]>;
  getWaiverByType(waiverType: WaiverType): Promise<Waiver>;
  attachWaiversToInvoice(
    waivers: WaiverType[],
    invoiceId: InvoiceId,
    dateCreated?: Date
  ): Promise<Waiver[]>;
}
