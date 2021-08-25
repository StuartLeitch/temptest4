import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { Payment } from '../../../payments/domain/Payment';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { Invoice } from '../../domain/Invoice';
import { CreditNote } from '../../../creditNotes/domain/CreditNote';

export interface WithInvoice {
  invoice: Invoice;
}

export interface WithInvoiceId {
  invoiceId: string;
}

export interface WithPayer {
  payer: Payer;
}

export interface WithInvoiceItems {
  invoiceItems: InvoiceItem[];
}

export interface WithBillingAddress {
  billingAddress: Address;
}

export interface WithPayments {
  payments: Payment[];
}

export interface InvoiceConfirmedData {
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  invoice: Invoice;
  payer: Payer;
}

export interface InvoiceCreatedData {
  invoiceItems: InvoiceItem[];
  manuscript: Manuscript;
  invoice: Invoice;
}

export interface InvoicePayedData {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  payments: Payment[];
  paymentDate: Date;
  invoice: Invoice;
  payer: Payer;
}

export interface InvoiceFinalizedData {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  payments: Payment[];
  invoice: Invoice;
  payer: Payer;
}

export interface InvoiceCreditedData {
  paymentMethods: PaymentMethod[];
  invoiceItems: InvoiceItem[];
  billingAddress: Address;
  manuscript: Manuscript;
  payments: Payment[];
  invoice: Invoice;
  creditNote: CreditNote;
  payer: Payer;
}
