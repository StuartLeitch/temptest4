import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { RepoError } from '../../../../infrastructure/RepoError';

import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteId } from '../../domain/CreditNoteId';
import { CreditNoteRepoContract } from './../creditNoteRepo';
import { CreditNoteMap } from '../../mappers/CreditNoteMap';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { PaginatedCreditNoteResult } from '../creditNoteRepo';
import { applyFilters } from './utils';

// to be updated with GuardFailure
export class KnexCreditNoteRepo
  extends AbstractBaseDBRepo<Knex, CreditNote>
  implements CreditNoteRepoContract {
  constructor(protected db: Knex, protected logger?: any) {
    super(db, logger);
  }

  private withErpReferenceQuery(
    alias: string,
    associatedField: string,
    type: string,
    vendor: string,
    attribute: string
  ): any {
    const { db } = this;
    return (query) =>
      query
        .column({ [attribute]: `${alias}.value` })
        .leftJoin({ [alias]: TABLES.ERP_REFERENCES }, function () {
          this.on(`${alias}.entity_id`, associatedField)
            .andOn(`${alias}.vendor`, db.raw('?', [vendor]))
            .andOn(`${alias}.type`, db.raw('?', [type]))
            .andOn(`${alias}.attribute`, db.raw('?', [attribute]));
        });
  }

  private filterCreditNotesReadyForErpRegistration(): any {
    return (query) => query.whereNull('creditnoteref.value');
  }

  public async getCreditNoteByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const { db } = this;

    const creditNote = await db(TABLES.CREDIT_NOTES)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();

    if (!creditNote) {
      throw RepoError.createEntityNotFoundError(
        'creditNote',
        invoiceId.id.toString()
      );
    }

    return CreditNoteMap.toDomain(creditNote);
  }

  public async getCreditNoteByReferenceNumber(
    referenceNumber: string
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const { db } = this;
    const creditNote = await db(TABLES.CREDIT_NOTES)
      .select()
      .where({ persistentReferenceNumber: referenceNumber })
      .first();

    if (!creditNote) {
      throw RepoError.createEntityNotFoundError('creditNote', referenceNumber);
    }

    return CreditNoteMap.toDomain(creditNote);
  }

  public async getCreditNoteById(
    creditNoteId: CreditNoteId
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const { logger, db } = this;

    const creditNote = await db(TABLES.CREDIT_NOTES)
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

  async getUnregisteredErpCreditNotes(): Promise<
    Either<GuardFailure | RepoError, CreditNoteId[]>
  > {
    const { db, logger } = this;

    const erpReferenceQuery = db(TABLES.CREDIT_NOTES)
      .columns({ creditNoteId: 'credit_notes.id' })
      .select();

    const withCreditNoteErpReference = this.withErpReferenceQuery(
      'creditnoteref',
      'credit_notes.id',
      'invoice',
      'netsuite',
      'creditNote'
    );

    const filterCreditNotesReadyForERP = this.filterCreditNotesReadyForErpRegistration();

    const prepareIdsSQL = filterCreditNotesReadyForERP(
      withCreditNoteErpReference(erpReferenceQuery)
    );

    logger.debug('select', {
      unregisteredCreditNotes: prepareIdsSQL.toString(),
    });

    const creditNotes = await prepareIdsSQL;

    return creditNotes.map((cn) =>
      CreditNoteId.create(new UniqueEntityID(cn.creditNoteId))
    );
  }

  async update(
    creditNote: CreditNote
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const { db } = this;
    const updateObject = CreditNoteMap.toPersistence(creditNote);
    const updated = await db(TABLES.CREDIT_NOTES)
      .where('id', creditNote.creditNoteId.id.toString())
      .update(updateObject);

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'creditNote',
        creditNote.creditNoteId.id.toString()
      );
    }

    return right(creditNote);
  }

  async exists(
    creditNote: CreditNote
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const result = await this.getCreditNoteById(creditNote.creditNoteId);

    return right(!!result);
  }

  async save(
    creditNote: CreditNote
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const { db } = this;

    const rawCreditNote = CreditNoteMap.toPersistence(creditNote);

    try {
      await db(TABLES.CREDIT_NOTES).insert(rawCreditNote);
    } catch (error) {
      throw RepoError.fromDBError(error);
    }

    return this.getCreditNoteById(creditNote.creditNoteId);
  }

  async existsWithId(
    creditNoteId: CreditNoteId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const result = await this.db(TABLES.CREDIT_NOTES)
      .where('id', creditNoteId.id.toString())
      .countDistinct({ creditNoteCount: 'id' })
      .first();

    return right(result.creditNoteCount !== 0);
  }

  async getCreditNoteByCustomId(
    customId: string
  ): Promise<Either<GuardFailure | RepoError, CreditNote>> {
    const { db } = this;

    const result = await db
      .select(
        'credit_notes.invoiceId AS invoiceId',
        'credit_notes.dateCreated AS creditNoteDateCreated',
        'articles.customId AS customId',
        'articles.datePublished AS datePublished'
      )
      .from('articles')
      .leftJoin(
        'invoice_items',
        'invoice_items.manuscriptId',
        '=',
        'articles.id'
      )
      .leftJoin(
        'credit_notes',
        'invoice_items.invoiceId',
        '=',
        'credit_notes.invoiceId'
      )
      .where({ 'articles.customId': customId })
      .first();

    if (result.length === 0) {
      throw RepoError.createEntityNotFoundError('article', customId);
    }

    return result;
  }

  async getRecentCreditNotes(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, PaginatedCreditNoteResult>> {
    const { pagination, filters } = args;
    const { db } = this;

    const getModel = () => db(TABLES.CREDIT_NOTES);

    const totalCount = await applyFilters(getModel(), filters).count(
      `${TABLES.CREDIT_NOTES}.id`
    );

    const offset = pagination.offset * pagination.limit;

    const sql = applyFilters(getModel(), filters)
    .orderBy(`${TABLES.CREDIT_NOTES}.dateCreated`, 'desc')
    .offset(offset < totalCount[0].count ? offset : 0)
    .limit(pagination.limit)
    .select([`${TABLES.CREDIT_NOTES}.*`]);

    console.info(sql.toString());
    const creditNotes: Array<any> = await sql;

    const maybeInvoices = flatten(creditNotes.map(CreditNoteMap.toDomain));
    if (maybeInvoices.isLeft()) {
      return left(maybeInvoices.value);
    }

    return right({
      totalCount: totalCount[0]['count'],
      creditNotes: maybeInvoices.value,
    });
  }
}
