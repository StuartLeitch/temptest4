import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { ManuscriptId } from '../../manuscripts/domain/ManuscriptId';
import { InvoiceItemId } from '../domain/InvoiceItemId';
import { InvoiceItem } from '../domain/InvoiceItem';
import { InvoiceId } from '../domain/InvoiceId';

export interface InvoiceItemRepoContract extends Repo<InvoiceItem> {
  getInvoiceItemById(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem>>;
  getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem[]>>;
  getInvoiceItemCollection(): Promise<
    Either<GuardFailure | RepoError, InvoiceItem[]>
  >;
  delete(
    invoiceItem: InvoiceItem
  ): Promise<Either<GuardFailure | RepoError, void>>;
  restore(
    invoiceItem: InvoiceItem
  ): Promise<Either<GuardFailure | RepoError, void>>;
  getItemsByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem[]>>;
  update(
    invoiceItem: InvoiceItem
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem>>;
  invoiceItemCreditNoteJoinQuery?(): any;
}
