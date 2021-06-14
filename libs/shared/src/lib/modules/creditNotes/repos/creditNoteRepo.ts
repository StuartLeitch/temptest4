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
  getRecentCreditNotes(args?: any): Promise<any>;
  getUnregisteredErpCreditNotes(): Promise<CreditNoteId[]>;
  getCreditNoteByCustomId(customId: string): Promise<CreditNote>;
  existsWithId(creditNoteId: CreditNoteId): Promise<boolean>;
  update(creditNote: CreditNote): Promise<CreditNote>;
}
