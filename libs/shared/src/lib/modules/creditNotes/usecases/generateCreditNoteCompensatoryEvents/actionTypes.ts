import { Invoice } from '../../../invoices/domain/Invoice';
import { CreditNote } from '../../domain/CreditNote';

export interface WithCreditNoteId {
  creditNoteId: string;
}

export interface WithCreditNote {
  creditNote: CreditNote;
}

export interface WithInvoice {
  invoice: Invoice;
}
