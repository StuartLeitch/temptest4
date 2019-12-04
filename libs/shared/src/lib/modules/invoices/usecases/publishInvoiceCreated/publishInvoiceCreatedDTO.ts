import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Invoice } from '../../domain/Invoice';

export interface PublishInvoiceCreatedDTO {
  invoiceItems: InvoiceItem[];
  manuscript: Manuscript;
  invoice: Invoice;
}
