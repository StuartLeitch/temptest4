import { PaymentMethod } from '../../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { Address } from '../../../../addresses/domain/Address';
import { Payment } from '../../../../payments/domain/Payment';
import { InvoiceItem } from '../../../../invoices/domain/InvoiceItem';
import { Payer } from '../../../../payers/domain/Payer';
import { Invoice } from '../../../../invoices/domain/Invoice';
import { CreditNote } from '../../../domain/CreditNote';

export interface PublishCreditNoteCreatedDTO {
  payer?: Payer;
  invoice?: Invoice;
  payments?: Payment[];
  manuscript: Manuscript;
  creditNote: CreditNote;
  invoiceItems: InvoiceItem[];
  paymentMethods: PaymentMethod[];
  billingAddress?: Address;
  messageTimestamp?: Date;
}
