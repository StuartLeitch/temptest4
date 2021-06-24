import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { CreditNote } from '../domain/CreditNote';
import { CreditNoteId } from '../domain/CreditNoteId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

// to be updated with GuardFailure
export interface PaginatedCreditNoteResult {
  totalCount: string;
  creditNotes: Array<CreditNote>;
}
export interface CreditNoteRepoContract extends Repo<CreditNote> {
  getCreditNoteByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, CreditNote>>;
  getCreditNoteById(
    creditNoteId: CreditNoteId
  ): Promise<Either<GuardFailure | RepoError, CreditNote>>;
  getCreditNoteByReferenceNumber(
    referenceNumber: string
  ): Promise<Either<GuardFailure | RepoError, CreditNote>>;
  getRecentCreditNotes(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, PaginatedCreditNoteResult>>;
  getUnregisteredErpCreditNotes(): Promise<
    Either<GuardFailure | RepoError, CreditNoteId[]>
  >;
  getCreditNoteByCustomId(
    customId: string
  ): Promise<Either<GuardFailure | RepoError, CreditNote>>;
  existsWithId(
    creditNoteId: CreditNoteId
  ): Promise<Either<GuardFailure | RepoError, boolean>>;
  update(
    creditNote: CreditNote
  ): Promise<Either<GuardFailure | RepoError, CreditNote>>;
}
