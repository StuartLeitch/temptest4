import { CouponAssigned } from '../../../coupons/domain/CouponAssigned';
import { WaiverAssigned } from '../../../waivers/domain/WaiverAssigned';
import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { Address } from '../../../addresses/domain/Address';
import { Invoice } from '../../../invoices/domain/Invoice';
import { Payment } from '../../../payments/domain/Payment';
import { CreditNote } from '../../domain/CreditNote';
import { Payer } from '../../../payers/domain/Payer';

export interface WithCreditNoteId {
  creditNoteId: string;
}

export interface WithCreditNote {
  creditNote: CreditNote;
}

export interface WithInvoice {
  invoice: Invoice;
}

export interface WithPayer {
  payer: Payer;
}

export interface WithInvoiceItems {
  invoiceItems: InvoiceItem[];
}

export interface WithPublishDTO {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  coupons: CouponAssigned[];
  waivers: WaiverAssigned[];
  billingAddress: Address;
  creditNote: CreditNote;
  article: Manuscript;
  payments: Payment[];
  invoice: Invoice;
  payer: Payer;
}
