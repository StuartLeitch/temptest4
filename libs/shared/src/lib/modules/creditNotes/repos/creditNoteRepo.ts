import { Guard } from '../../../core/logic/Guard';
import { Either } from '../../../core/logic/Either';

import { Repo } from '../../../infrastructure/Repo';
import { CreditNote } from '../domain/CreditNote';
import { CreditNoteId } from '../domain/CreditNoteId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

// to be updated with GuardFailure
export interface CreditNoteRepoContract extends Repo<CreditNote> {
  getCreditNoteByInvoiceId(invoiceId: InvoiceId): Promise<CreditNote>;
  getCreditNoteById(creditNoteId: CreditNoteId): Promise<CreditNote>;
  update(creditNote: CreditNote): Promise<CreditNote>;
}
