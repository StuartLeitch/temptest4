import { Invoice } from '../../../invoices/domain/Invoice';
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
