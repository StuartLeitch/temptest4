import { AbstractBaseDBRepo } from 'libs/shared/src/lib/infrastructure/AbstractBaseDBRepo';
import { Either, left, right } from '../../../../core/logic/Either';
import { Guard } from '../../../../core/logic/Guard';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import {
  RepoError,
  RepoErrorCode,
} from 'libs/shared/src/lib/infrastructure/RepoError';

import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteId } from '../../domain/CreditNoteId';
import { CreditNoteRepoContract } from './../creditNoteRepo';
import { CreditNoteMap } from '../../mappers/CreditNoteMap';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';

// to be updated with GuardFailure
export class KnexCreditNoteRepo
  extends AbstractBaseDBRepo<Knex, CreditNote>
  implements CreditNoteRepoContract {
  constructor(
    protected db: Knex,
    protected logger?: any,
    private invoiceRepo?: InvoiceRepoContract
  ) {
    super(db, logger);
  }

  public async getCreditNoteByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<CreditNote> {
    const { db } = this;

    const creditNote = await db(TABLES.CREDITNOTES)
      .select()
      .where('id', invoiceId.id.toString())
      .first();

    if (!creditNote) {
      throw RepoError.createEntityNotFoundError(
        'creditNote',
        invoiceId.id.toString()
      );
    }

    return CreditNoteMap.toDomain(creditNote);
  }

  public async getCreditNoteById(
    creditNoteId: CreditNoteId
  ): Promise<CreditNote> {
    const { logger, db } = this;

    const creditNote = await db(TABLES.CREDITNOTES)
      .select()
      .where('id', creditNoteId.id.toString())
      .first();

    if (!creditNote) {
      throw RepoError.createEntityNotFoundError(
        'creditNote',
        creditNoteId.id.toString()
      );
    }

    return CreditNoteMap.toDomain(creditNote);
  }

  async update(creditNote: CreditNote): Promise<CreditNote> {
    const { db } = this;
    const updateObject = CreditNoteMap.toPersistence(creditNote);
    const updated = await db(TABLES.CREDITNOTES)
      .where('id', creditNote.creditNoteId.id.toString())
      .update(updateObject);

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'creditNote',
        creditNote.creditNoteId.id.toString()
      );
    }

    return creditNote;
  }

  async exists(creditNote: CreditNote): Promise<boolean> {
    try {
      await this.getCreditNoteById(creditNote.creditNoteId);
    } catch (error) {
      if (error.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }
      throw error;
    }
    return true;
  }

  async save(creditNote: CreditNote): Promise<CreditNote> {
    const { db } = this;

    const rawCreditNote = CreditNoteMap.toPersistence(creditNote);

    try {
      await db(TABLES.CREDITNOTES).insert(rawCreditNote);
    } catch (error) {
      throw RepoError.fromDBError(error);
    }

    return this.getCreditNoteById(creditNote.creditNoteId);
  }
}
