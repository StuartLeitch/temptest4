import { Transform } from 'stream';

import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { TransactionId } from '../../../transactions/domain/TransactionId';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import { InvoicePaginated } from '../../domain/InvoicesPaginated';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';

import { InvoiceMap } from '../../mappers/InvoiceMap';

import type { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { ErpReferenceRepoContract } from './../../../vendors/repos';
import { InvoiceItemRepoContract } from '../invoiceItemRepo';
import { InvoiceRepoContract } from '../invoiceRepo';

import { applyFilters } from './utils';

export class KnexInvoiceRepo
  extends AbstractBaseDBRepo<Knex, Invoice>
  implements InvoiceRepoContract {
  constructor(
    protected db: Knex,
    protected logger?: any,
    private models?: any,
    private articleRepo?: ArticleRepoContract,
    private invoiceItemRepo?: InvoiceItemRepoContract,
    private erpReferenceRepo?: ErpReferenceRepoContract
  ) {
    super(db, logger);
  }

  private withInvoicesItemsDetailsQuery(): any {
    return (query) =>
      query.leftJoin(
        TABLES.INVOICE_ITEMS,
        'invoice_items.invoiceId',
        'invoices.id'
      );
  }

  private withCreditNoteDetailsQuery(): any {
    return (query) =>
      query.leftJoin(TABLES.INVOICES, 'invoices.id', 'credit_notes.invoiceId');
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

  public async getInvoiceById(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const { logger, db } = this;

    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    const sql = db(TABLES.INVOICES)
      .select()
      .where('id', invoiceId.id.toString())
      .first();

    logger.debug('select', {
      correlationId,
      sql: sql.toString(),
    });

    const invoice = await sql;
    if (!invoice) {
      return left(
        RepoError.createEntityNotFoundError('invoice', invoiceId.id.toString())
      );
    }

    const erpReferencesSQL = db(TABLES.ERP_REFERENCES)
      .select()
      .where('entity_id', invoiceId.id.toString());

    logger.debug('select', {
      correlationId,
      erpReferencesSQL: erpReferencesSQL.toString(),
    });

    const associatedErpReferences = await erpReferencesSQL;
    const erpReferences = associatedErpReferences.reduce(
      (refs, { type, vendor, attribute, value }) => {
        refs.push({
          entity_id: invoiceId.id.toString(),
          type,
          vendor,
          attribute,
          value,
        });
        return refs;
      },
      []
    );

    return InvoiceMap.toDomain({
      ...invoice,
      referenceNumber: invoice.persistentReferenceNumber,
      erpReferences,
    });
  }

  public async getInvoiceByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const { db } = this;

    const invoice = await db(TABLES.INVOICE_ITEMS)
      .select()
      .where('id', invoiceItemId.id.toString())
      .first();

    if (!invoice) {
      return left(
        RepoError.createEntityNotFoundError(
          'invoiceItem',
          invoiceItemId.id.toString()
        )
      );
    }

    return InvoiceMap.toDomain(invoice);
  }

  async getRecentInvoices(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, InvoicePaginated>> {
    const { pagination, filters } = args;
    const { db } = this;

    const getModel = () =>
      db(TABLES.INVOICES).whereNot(`${TABLES.INVOICES}.deleted`, 1);

    const totalCount = await applyFilters(getModel(), filters).count(
      `${TABLES.INVOICES}.id`
    );

    const offset = pagination.offset * pagination.limit;

    const sql = applyFilters(getModel(), filters)
      .orderBy(`${TABLES.INVOICES}.dateCreated`, 'desc')
      .offset(offset < totalCount[0].count ? offset : 0)
      .limit(pagination.limit)
      .select([`${TABLES.INVOICES}.*`]);
    console.info(sql.toString());

    const invoices: Array<any> = await sql;

    const maybeInvoices = flatten(invoices.map(InvoiceMap.toDomain));

    if (maybeInvoices.isLeft()) {
      return left(maybeInvoices.value);
    }

    return right({
      totalCount: totalCount[0]['count'],
      invoices: maybeInvoices.value,
    });
  }

  async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Either<GuardFailure | RepoError, Invoice[]>> {
    const { db } = this;
    const invoices = await db(TABLES.INVOICES)
      .select()
      .where('transactionId', transactionId.id.toString());

    return flatten(invoices.map((i) => InvoiceMap.toDomain(i)));
  }

  async isInvoiceDeleted(
    id: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const isDeleted = await this.db(`${TABLES.INVOICES}`)
      .select('deleted')
      .where('id', id.id.toString())
      .first();

    return right(!!isDeleted.deleted);
  }

  async getInvoicesByCustomId(
    customId: string
  ): Promise<Either<GuardFailure | RepoError, Invoice[]>> {
    const { db } = this;

    const result = await db
      .select(
        'invoices.id AS invoiceId',
        'invoices.status AS invoiceStatus',
        'invoices.dateCreated as invoiceDateCreated',
        'articles.customId as customId',
        'articles.datePublished as datePublished'
      )
      .from('articles')
      .leftJoin(
        'invoice_items',
        'invoice_items.manuscriptId',
        '=',
        'articles.id'
      )
      .leftJoin('invoices', 'invoice_items.invoiceId', '=', 'invoices.id')
      .where({ 'articles.customId': customId });

    if (result.length === 0) {
      return left(RepoError.createEntityNotFoundError('article', customId));
    }

    return flatten(result.map(InvoiceMap.toDomain));
  }

  async getCurrentInvoiceNumber(): Promise<number> {
    const { db, logger } = this;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // * Hindawi fiscal year starts at 1st of January
    let timeRange = [`${currentYear}-01-01`, `${currentYear + 1}-01-01`];

    // * Wiley fiscal year starts at 1st of May
    if (currentMonth < 5) {
      timeRange = [`${currentYear - 1}-05-01`, `${currentYear}-04-30`];
    } else {
      timeRange = [`${currentYear}-05-01`, `${currentYear + 1}-04-30`];
    }

    const getLastInvoiceNumber = await db.raw(
      `SELECT
        COALESCE((
          SELECT
            max("invoiceNumber") AS max FROM (
              SELECT
                max("invoiceNumber") AS "invoiceNumber" FROM invoices
              WHERE
                "dateIssued" BETWEEN ?
                AND ?
              UNION
              SELECT
                "invoiceReferenceNumber" AS "invoiceNumber" FROM configurations) referenceNumbers), 1)
      `,
      timeRange
    );

    logger.debug('lastInvoiceNumber', {
      value: getLastInvoiceNumber,
    });

    return getLastInvoiceNumber.rows[0].coalesce;
  }

  async getInvoicePaymentInfo(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, InvoicePaymentInfo>> {
    const result = await this.db
      .select(
        'invoices.id as invoiceId',
        'invoices.transactionId as transactionId',
        'invoices.status as invoiceStatus',
        'invoices.invoiceNumber as invoiceNumber',
        'invoices.dateIssued as invoiceIssueDate',
        'payers.email as payerEmail',
        'payers.name as payerName',
        'payers.type as payerType',
        'payers.vatId as vatRegistrationNumber',
        'addressLine1 as address',
        'city',
        'country',
        'payments.foreignPaymentId as foreignPaymentId',
        'payments.amount as amount',
        'payments.datePaid as paymentDate',
        'payment_methods.name as paymentType'
      )
      .from('invoices')
      .leftJoin('payers', 'payers.invoiceId', '=', 'invoices.id')
      .leftJoin('addresses', 'payers.billingAddressId', '=', 'addresses.id')
      .leftJoin('payments', 'payments.invoiceId', '=', 'invoices.id')
      .leftJoin(
        'payment_methods',
        'payment_methods.id',
        '=',
        'payments.paymentMethodId'
      )
      .where({ 'invoices.id': invoiceId.id.toString() });

    if (result.length === 0) {
      return left(
        RepoError.createEntityNotFoundError('invoice', invoiceId.id.toString())
      );
    }

    return right(result[0]);
  }

  async getInvoicePayments(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, any[]>> {
    const results = await this.db
      .select(
        'invoices.id as invoiceId',
        'invoices.transactionId as transactionId',
        'payments.foreignPaymentId as foreignPaymentId',
        'payments.amount as amount',
        'payments.datePaid as paymentDate',
        'payment_methods.name as paymentType'
      )
      .from('invoices')
      .leftJoin('payments', 'payments.invoiceId', '=', 'invoices.id')
      .leftJoin(
        'payment_methods',
        'payment_methods.id',
        '=',
        'payments.paymentMethodId'
      )
      .where({ 'invoices.id': invoiceId.id.toString() });

    if (results.length === 0) {
      return left(
        RepoError.createEntityNotFoundError('invoice', invoiceId.id.toString())
      );
    }

    return right(results);
  }

  private filterReadyForRevenueRecognition(): any {
    const { db } = this;

    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
        .whereNotNull('erprefs.value')
        .where('erprefs.value', '<>', 'ERP_NOT_FOUND')
        .where('erprefs.value', '<>', 'NON_INVOICEABLE')
        .where('erprefs.value', '<>', 'MigrationRef')
        .where('erprefs.value', '<>', 'migrationRef')
        .whereNull('revrec.value')
        .whereNotIn(
          'invoices.id',
          db.raw(`SELECT invoiceId FROM credit_notes`)
        );
  }

  private filterRevenueRecognitionReadyForErpRegistration(): any {
    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['FINAL'])
        .whereNull('revenuerecognitionreversalref.value');
  }

  private async getUnrecognizedInvoices(vendor: string) {
    const LIMIT = 25;
    const { db, logger } = this;

    const erpReferencesQuery = db(TABLES.INVOICES)
      .column({ invoiceId: 'invoices.id' })
      .select();
    const withInvoiceItems = this.withInvoicesItemsDetailsQuery();
    const filterArticlesByNotNullDatePublished = this.articleRepo.filterBy({
      whereNotNull: 'articles.datePublished',
    });
    const withErpReference = this.withErpReferenceQuery(
      'erprefs',
      'invoices.id',
      'invoice',
      vendor,
      'confirmation'
    );
    const withRevenueRecognitionErpReference = this.withErpReferenceQuery(
      'revrec',
      'invoices.id',
      'invoice',
      vendor,
      'revenueRecognition'
    );

    // * SQL for retrieving results needed only for Sage registration
    const filterInvoicesReadyForRevenueRecognition = this.filterReadyForRevenueRecognition();

    const prepareIdsSQL = filterArticlesByNotNullDatePublished(
      filterInvoicesReadyForRevenueRecognition(
        withErpReference(
          withRevenueRecognitionErpReference(
            withInvoiceItems(erpReferencesQuery)
          )
        )
      )
    ).limit(LIMIT);

    logger.debug('select', {
      [`${vendor.toUpperCase()}_SQL`]: prepareIdsSQL.toString(),
    });

    const invoices: Array<any> = await prepareIdsSQL;

    return invoices.map((i) =>
      InvoiceId.create(new UniqueEntityID(i.invoiceId))
    );
  }

  public async getUnrecognizedSageErpInvoices(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    const maybeIds = await this.getUnrecognizedInvoices('sage');
    return right(maybeIds);
  }

  public async getUnrecognizedNetsuiteErpInvoices(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    const maybeIds = await this.getUnrecognizedInvoices('netsuite');
    return right(maybeIds);
  }

  private filterReadyForRegistration(): any {
    const { db } = this;
    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
        .whereNotIn('invoices.id', db.raw(`SELECT invoiceId FROM credit_notes`))
        .whereNull('erprefs.value');
  }

  private async getUnregisteredInvoices(vendor: string) {
    const LIMIT = 25;
    const { db, logger } = this;

    const erpReferencesQuery = db(TABLES.INVOICES)
      .column({ invoiceId: 'invoices.id' })
      .select();
    const withInvoiceItems = this.withInvoicesItemsDetailsQuery();

    const withErpReference = this.withErpReferenceQuery(
      'erprefs',
      'invoices.id',
      'invoice',
      vendor,
      'confirmation'
    );

    // * SQL for retrieving results needed only for registration
    const filterInvoicesReadyForRevenueRecognition = this.filterReadyForRegistration();

    const prepareIdsSQL = filterInvoicesReadyForRevenueRecognition(
      withErpReference(withInvoiceItems(erpReferencesQuery))
    ).limit(LIMIT);

    logger.debug('select', {
      [`${vendor.toUpperCase()}_SQL`]: prepareIdsSQL.toString(),
    });

    const invoices: Array<any> = await prepareIdsSQL;

    return invoices.map((i) =>
      InvoiceId.create(new UniqueEntityID(i.invoiceId))
    );
  }

  public async getFailedNetsuiteErpInvoices(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    const maybeIds = await this.getUnregisteredInvoices('netsuite');
    return right(maybeIds);
  }

  public async getFailedSageErpInvoices(): Promise<
    Either<GuardFailure | RepoError, InvoiceId[]>
  > {
    const maybeIds = await this.getUnregisteredInvoices('sage');
    return right(maybeIds);
  }

  async delete(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const deletedRows = await db(TABLES.INVOICES)
      .where('id', invoice.id.toString())
      .update({ ...InvoiceMap.toPersistence(invoice), deleted: 1 });

    if (!deletedRows) {
      return left(
        RepoError.createEntityNotFoundError('invoice', invoice.id.toString())
      );
    }

    return right(null);
  }

  async restore(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const restoredRows = await db(TABLES.INVOICES)
      .where('id', invoice.id.toString())
      .update({ ...InvoiceMap.toPersistence(invoice), deleted: 0 });

    if (!restoredRows) {
      return left(
        RepoError.createEntityNotFoundError('invoice', invoice.id.toString())
      );
    }

    return right(null);
  }

  async update(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const { db } = this;
    const updateObject = InvoiceMap.toPersistence(invoice);
    const updated = await db(TABLES.INVOICES)
      .where({ id: invoice.invoiceId.id.toString() })
      .update(updateObject);

    if (!updated) {
      return left(
        RepoError.createEntityNotFoundError('invoice', invoice.id.toString())
      );
    }

    return this.getInvoiceById(invoice.invoiceId);
  }

  async exists(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.getInvoiceById(invoice.invoiceId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }

      return left(RepoError.fromDBError(e));
    }

    return right(true);
  }

  async existsWithId(
    id: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const result = await this.db(TABLES.INVOICES)
      .where('id', id.id.toString())
      .countDistinct({ invoiceCount: 'id' })
      .first();

    return right(result.invoiceCount !== 0);
  }

  async save(
    invoice: Invoice
  ): Promise<Either<GuardFailure | RepoError, Invoice>> {
    const { db } = this;

    const rawInvoice = InvoiceMap.toPersistence(invoice);

    try {
      await db(TABLES.INVOICES).insert(rawInvoice);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return this.getInvoiceById(invoice.invoiceId);
  }

  async *getInvoicesIds(
    ids: string[],
    journalIds: string[],
    omitDeleted: boolean
  ): AsyncGenerator<string, void, undefined> {
    const extractInvoiceId = new Transform({
      objectMode: true,
      transform(item, encoding, callback) {
        callback(null, item.invoiceId);
      },
    });

    let query = this.db(`${TABLES.INVOICES} as i`)
      .join(`${TABLES.INVOICE_ITEMS} as ii`, 'i.id', 'ii.invoiceId')
      .join(`${TABLES.ARTICLES} as a`, 'a.id', 'ii.manuscriptId')
      .join(`${TABLES.CATALOG} as c`, 'c.journalId', 'a.journalId')
      .select('ii.invoiceId');

    if (ids.length) {
      query = query.whereIn('ii.invoiceId', ids);
    }

    if (journalIds.length) {
      query = query.whereIn('c.id', journalIds);
    }

    if (omitDeleted) {
      query = query.where('i.deleted', 0);
    }

    const stream = query.stream({ objectMode: true }).pipe(extractInvoiceId);

    for await (const a of stream) {
      yield a;
    }
  }

  filterByInvoiceId(invoiceId: InvoiceId): any {
    return (query) => query.where('invoices.id', invoiceId.id.toString()); //.first();
  }

  filterBy(criteria): any {
    const [condition, field] = Object.entries(criteria)[0];
    return (query) => {
      const join = query
        .leftJoin(TABLES.INVOICES, 'invoices.id', 'invoice_items.invoiceId')
        .orderBy(field, 'desc');

      return join[condition](field);
    };
  }

  public async countInvoices(criteria: any): Promise<number> {
    const { db, logger } = this;

    const countInvoicesSQL = db(TABLES.INVOICES)
      .count('id as CNT')
      .where('status', criteria.status)
      .where('dateCreated', '>=', criteria.range.from.toString())
      .where('dateCreated', '<=', criteria.range.to.toString())
      .first();

    logger.debug('select', {
      [`countInvoices_SQL`]: countInvoicesSQL.toString(),
    });

    const { CNT } = await countInvoicesSQL;

    return Number(CNT);
  }

  public async getUnrecognizedReversalsNetsuiteErp(): Promise<
    Either<GuardFailure | RepoError, any[]>
  > {
    const { db, logger } = this;

    const erpReferencesQuery = db(TABLES.CREDIT_NOTES)
      .column({ invoiceId: 'invoices.id' })
      .select();

    const withCreditNoteDetails = this.withCreditNoteDetailsQuery();

    const withRevenueRecognitionReversalErpReference = this.withErpReferenceQuery(
      'revenuerecognitionreversalref',
      'invoices.id',
      'invoice',
      'netsuite',
      'revenueRecognitionReversal'
    );

    // * SQL for retrieving results needed only for ERP registration
    const filterRevenueRecognitionReadyForERP = this.filterRevenueRecognitionReadyForErpRegistration();

    const withCreditNoteErpReference = this.withErpReferenceQuery(
      'creditnoteref',
      'credit_notes.id',
      'invoice',
      'netsuite',
      'creditNote'
    );
    // * SQL for retrieving already registerd credit notes
    const filterRegisteredCreditNotesForERP = this.filterRegisteredCreditNotesForErpRegistration();

    const withRevenueRecognitionErpReference = this.withErpReferenceQuery(
      'revenuerecognitionref',
      'invoices.id',
      'invoice',
      'netsuite',
      'revenueRecognition'
    );
    // * SQL for retrieving already registerd credit notes
    const filterRegisteredRevenueRecognitionForERP = this.filterRegisteredRevenueRecognitionForErpRegistration();

    const prepareIdsSQL = filterRegisteredRevenueRecognitionForERP(
      withRevenueRecognitionErpReference(
        filterRegisteredCreditNotesForERP(
          withCreditNoteErpReference(
            filterRevenueRecognitionReadyForERP(
              withRevenueRecognitionReversalErpReference(
                withCreditNoteDetails(erpReferencesQuery)
              )
            )
          )
        )
      )
    );

    logger.debug('select', {
      unregisteredRevenueRecognitionReversal: prepareIdsSQL.toString(),
    });

    const revenueRecognitionReversals: Array<any> = await prepareIdsSQL;

    return right(
      revenueRecognitionReversals.map((i) =>
        InvoiceId.create(new UniqueEntityID(i.invoiceId))
      )
    );
  }

  private filterRegisteredCreditNotesForErpRegistration(): any {
    return (query) => query.whereNotNull('creditnoteref.value');
  }

  private filterRegisteredRevenueRecognitionForErpRegistration(): any {
    return (query) => query.whereNotNull('revenuerecognitionref.value');
  }
}
