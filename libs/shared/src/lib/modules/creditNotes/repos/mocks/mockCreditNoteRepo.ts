import { cloneDeep } from 'lodash';
import { Either, right, left } from '../../../../core/logic/Either';
import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { RepoError } from '../../../../infrastructure/RepoError';

import { GetRecentCreditNotesSuccessResponse as Response } from '../../usecases/getRecentCreditNotes/getRecentCreditNotesResponse';
import { CreditNoteRepoContract } from './../creditNoteRepo';
import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteId } from '../../domain/CreditNoteId';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { CreditNoteMap } from '../../mappers/CreditNoteMap';

export class MockCreditNoteRepo
  extends BaseMockRepo<CreditNote>
  implements CreditNoteRepoContract {
  constructor() {
    super();
  }

  public async getCreditNoteByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const match = this._items.find((i) => i.invoiceId.id.equals(invoiceId.id));

    if (match) {
      return right(match);
    } else {
      return left(
        RepoError.createEntityNotFoundError('credit note', invoiceId.toString())
      );
    }
  }

  public async getCreditNoteById(
    creditNoteId: CreditNoteId
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    let filterCreditNoteById = null;
    filterCreditNoteById = this.filterCreditNoteById(creditNoteId);
    if (!filterCreditNoteById) {
      return left(
        RepoError.createEntityNotFoundError(
          'credit note',
          creditNoteId.toString()
        )
      );
    }

    return CreditNoteMap.toDomain({
      ...CreditNoteMap.toPersistence(filterCreditNoteById),
    });
  }

  public async getCreditNoteByReferenceNumber(
    referenceNumber: string
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const match = this._items.find((i) =>
      i.persistentReferenceNumber.includes(referenceNumber)
    );
    return right(match ? match : null);
  }

  async existsWithId(
    creditNoteId: CreditNoteId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const match = this._items.filter((i) => i.invoiceId.equals(creditNoteId));
    return right(match.length !== 0);
  }

  public async getUnregisteredErpCreditNotes(): Promise<
    Either<GuardFailure | RepoError, CreditNoteId[]>
  > {
    return right(null);
  }

  public async getCreditNoteByCustomId(
    customId: string
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    return right(null);
  }

  async getRecentCreditNotes(): Promise<
    Either<GuardFailure | RepoError, Response>
  > {
    return right({
      totalCount: this._items.length,
      creditNotes: this._items,
    });
  }

  public async update(
    creditNote: CreditNote
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const maybeAlreadyExists = await this.exists(creditNote);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, creditNote)) {
          return creditNote;
        } else {
          return i;
        }
      });
    }

    return right(cloneDeep(creditNote));
  }

  public async save(
    creditNote: CreditNote
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const maybeAlreadyExists = await this.exists(creditNote);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, creditNote)) {
          return creditNote;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(creditNote);
    }
    return right(cloneDeep(creditNote));
  }

  public async exists(
    creditNote: CreditNote
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, creditNote)
    );
    return right(found.length !== 0);
  }

  public compareMockItems(a: CreditNote, b: CreditNote): boolean {
    return a.id.equals(b.id);
  }

  private filterCreditNoteById(creditNoteId: CreditNoteId) {
    const found = this._items.find((item) => item.id.equals(creditNoteId.id));

    if (!found) {
      return null;
    }

    return found;
  }

  public async *getCreditNoteIds(
    ids: string[],
    journalIds: string[],
    omitDeleted: boolean
  ): AsyncGenerator<string, void, undefined> {
    yield* this._items.map((item) => item.id.toString());
    // TODO: add the omitDeleted option searching in invoices
  }
}
