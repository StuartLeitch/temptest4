import { PaymentMethod } from '../../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { Address } from '../../../../addresses/domain/Address';
import { Payment } from '../../../../payments/domain/Payment';
import { InvoiceItem } from '../../../../invoices/domain/InvoiceItem';
import { Payer } from '../../../../payers/domain/Payer';
import { Invoice } from '../../../../invoices/domain/Invoice';
import { CreditNote } from '../../../domain/CreditNote';

export interface PublishCreditNoteCreatedDTO {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  billingAddress?: Address;
  messageTimestamp?: Date;
  manuscript: Manuscript;
  payments?: Payment[];
  creditNote: CreditNote;
  payer?: Payer;
  invoice?: Invoice;
}
