import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { Invoice } from '../../domain/Invoice';

export interface PublishInvoiceCreatedDTO {
  invoiceItems: InvoiceItem[];
  manuscript: Manuscript;
  address: Address;
  invoice: Invoice;
  payer: Payer;
}
