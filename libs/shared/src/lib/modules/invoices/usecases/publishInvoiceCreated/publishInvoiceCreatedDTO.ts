import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Invoice } from '../../domain/Invoice';

export interface PublishInvoiceCreatedDTO {
  invoiceItems: InvoiceItem[];
  messageTimestamp?: Date;
  manuscript: Manuscript;
  invoice: Invoice;
}
