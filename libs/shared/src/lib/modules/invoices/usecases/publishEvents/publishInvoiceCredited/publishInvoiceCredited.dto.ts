import { PaymentMethod } from '../../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { Address } from '../../../../addresses/domain/Address';
import { Payment } from '../../../../payments/domain/Payment';
import { InvoiceItem } from '../../../domain/InvoiceItem';
import { Payer } from '../../../../payers/domain/Payer';
import { Invoice } from '../../../domain/Invoice';

export interface PublishInvoiceCreditedDTO {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  billingAddress?: Address;
  messageTimestamp?: Date;
  manuscript: Manuscript;
  payments?: Payment[];
  creditNote: Invoice;
  payer?: Payer;
}
