import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Invoice } from '../../../invoices/domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';

import {
  PaymentStrategy,
  PaymentDetails,
} from '../../domain/strategies/payment-strategy';

export interface WithInvoiceId {
  invoiceId: string;
}

export interface WithInvoice {
  invoice: Invoice;
}

export interface SelectionData {
  payerIdentification?: string;
  paymentReference?: string;
}

export interface PaymentData {
  payerIdentification?: string;
  paymentReference?: string;
  strategy: PaymentStrategy;
  manuscript: Manuscript;
  invoice: Invoice;
  payer: Payer;
}

export interface WithPayment {
  paymentDetails: PaymentDetails;
  isFinalPayment?: boolean;
  datePaid?: string;
  invoice: Invoice;
  payer: Payer;
}
