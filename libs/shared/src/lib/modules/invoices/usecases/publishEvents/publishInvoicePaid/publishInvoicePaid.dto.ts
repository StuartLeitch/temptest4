import { PaymentMethod } from '../../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { Address } from '../../../../addresses/domain/Address';
import { Payment } from '../../../../payments/domain/Payment';
import { InvoiceItem } from '../../../domain/InvoiceItem';
import { Payer } from '../../../../payers/domain/Payer';
import { Invoice } from '../../../domain/Invoice';

export interface PublishInvoicePaidDTO {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  messageTimestamp?: Date;
  billingAddress: Address;
  manuscript: Manuscript;
  payments: Payment[];
  invoice: Invoice;
  payer: Payer;
}
