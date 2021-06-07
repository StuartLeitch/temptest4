/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Transform } from 'stream';

import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { TransactionId } from '../../../transactions/domain/TransactionId';

import { InvoiceRepoContract } from '../invoiceRepo';
import { InvoiceItemRepoContract } from '../invoiceItemRepo';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import type { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
// import { ErpReference } from './../../../vendors/domain/ErpReference';
import { ErpReferenceRepoContract } from './../../../vendors/repos';

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

  private createBaseDetailsQuery(): any {
    const { db } = this;
    const LIMIT = 200;

    return db(TABLES.INVOICES)
      .select(
        'invoices.id as invoiceId',
        'invoices.transactionId as transactionId',
        'invoices.status as invoiceStatus'
        // 'articles.id AS manuscriptId',
        // 'articles.datePublished'
      )
      .leftJoin(TABLES.INVOICE_ITEMS, 'invoice_items.invoiceId', 'invoices.id')
      .limit(LIMIT)
      .offset(0);
  }

  private createErpDetailsQuery(): any {
    const { db } = this;

    return db(TABLES.INVOICES)
      .select(
        'invoices.id',
        'erp_references.type',
        'erp_references.vendor',
        'erp_references.attribute',
        'erp_references.value'
      )
      .leftJoin(
        TABLES.ERP_REFERENCES,
        'erp_references.entity_id',
        'invoices.id'
      );
  }

  private createBaseArticleDetailsQuery(): any {
    const { db } = this;

    return db(TABLES.ARTICLES)
      .select(
        'articles.id AS manuscriptId',
        'articles.datePublished',
        'invoices.id as invoiceId',
        'invoices.transactionId as transactionId',
        'invoices.status as invoiceStatus',
        'invoices.invoiceNumber AS invoiceNumber',
        'invoices.revenueRecognitionReference',
        'invoices.nsReference',
        'invoices.nsRevRecReference'
      )
      .leftJoin(
        TABLES.INVOICE_ITEMS,
        'invoice_items.manuscriptId',
        'articles.id'
      );
  }

  private withInvoicesItemsDetailsQuery(): any {
    return (query) =>
      query.leftJoin(
        TABLES.INVOICE_ITEMS,
        'invoice_items.invoiceId',
        'invoices.id'
      );
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

  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
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
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoiceId.id.toString()
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
  ): Promise<Invoice> {
    const { db } = this;

    const invoice = await db(TABLES.INVOICE_ITEMS)
      .select()
      .where('id', invoiceItemId.id.toString())
      .first();

    if (!invoice) {
      throw RepoError.createEntityNotFoundError(
        'invoiceItem',
        invoiceItemId.id.toString()
      );
    }

    return InvoiceMap.toDomain(invoice);
  }

  async getRecentInvoices(args?: any): Promise<any> {
    const { pagination, filters } = args;
    const { db } = this;

    const getModel = () =>
      db(TABLES.INVOICES).whereNot(`${TABLES.INVOICES}.deleted`, 1);

    const totalCount = await applyFilters(getModel(), filters).count(
      `${TABLES.INVOICES}.id`
    );

    const offset = pagination.offset * pagination.limit;

    const invoices = await applyFilters(getModel(), filters)
      .orderBy(`${TABLES.INVOICES}.dateCreated`, 'desc')
      .offset(offset < totalCount[0].count ? offset : 0)
      .limit(pagination.limit)
      .select([`${TABLES.INVOICES}.*`]);

    return {
      totalCount: totalCount[0]['count'],
      invoices: invoices.map((i) => InvoiceMap.toDomain(i)),
    };
  }

  async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const { db } = this;
    const invoices = await db(TABLES.INVOICES)
      .select()
      .where('transactionId', transactionId.id.toString());

    return invoices.map((i) => InvoiceMap.toDomain(i));
  }

  async isInvoiceDeleted(id: InvoiceId): Promise<boolean> {
    const isDeleted = await this.db(`${TABLES.INVOICES}`)
      .select('deleted')
      .where('id', id.id.toString())
      .first();

    return !!isDeleted.deleted;
  }

  async getInvoicesByCustomId(customId: string): Promise<Invoice[]> {
    const { db } = this;

    const result = await db
      .select(
        'invoices.id AS invoiceId',
        'invoices.cancelledInvoiceReference AS cancelledInvoiceReference',
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
      throw RepoError.createEntityNotFoundError('article', customId);
    }

    return result;
    // return invoices.map((i) => InvoiceMap.toDomain(i));
  }

  async findByCancelledInvoiceReference(
    invoiceId: InvoiceId
  ): Promise<Invoice> {
    const { db } = this;

    const invoice = await db(TABLES.INVOICES)
      .select()
      .where('cancelledInvoiceReference', invoiceId.id.toString())
      .first();

    if (!invoice) {
      throw RepoError.createEntityNotFoundError(
        'creditNote',
        invoiceId.id.toString()
      );
    }

    return InvoiceMap.toDomain(invoice);
  }

  async getCurrentInvoiceNumber(): Promise<number> {
    const { db, logger } = this;

    // const currentYear = new Date().getFullYear();

    // const getLastInvoiceNumber = await db.raw(
    //   `SELECT
    //     COALESCE((
    //       SELECT
    //         max("invoiceNumber") AS max FROM (
    //           SELECT
    //             max("invoiceNumber") AS "invoiceNumber" FROM invoices
    //           WHERE
    //             "dateIssued" BETWEEN ?
    //             AND ?
    //           UNION
    //           SELECT
    //             "invoiceReferenceNumber" AS "invoiceNumber" FROM configurations) referenceNumbers), 1)
    //   `,
    //   [`${currentYear}-01-01`, `${currentYear + 1}-01-01`]
    // );

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
  ): Promise<InvoicePaymentInfo> {
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
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoiceId.id.toString()
      );
    }

    return result[0];
  }

  async getInvoicePayments(
    invoiceId: InvoiceId
  ): Promise<any[]> {
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
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoiceId.id.toString()
      );
    }

    return results;
  }

  private filterReadyForRevenueRecognition(): any {
    const { db } = this;

    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
        .whereNull('invoices.cancelledInvoiceReference')
        .whereNotNull('erprefs.value')
        .where('erprefs.value', '<>', 'ERP_NOT_FOUND')
        .where('erprefs.value', '<>', 'NON_INVOICEABLE')
        .where('erprefs.value', '<>', 'MigrationRef')
        .where('erprefs.value', '<>', 'migrationRef')
        .whereNull('revrec.value')
        .whereNotIn(
          'invoices.id',
          db.raw(
            `SELECT invoices."cancelledInvoiceReference" from invoices where invoices."cancelledInvoiceReference" is not NULL`
          )
        );
  }

  private filterCreditNotesReadyForErpRegistration(): any {
    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['FINAL'])
        .whereNotNull('invoices.cancelledInvoiceReference')
        .whereNull('creditnoteref.value');
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

    const invoices = await prepareIdsSQL;

    return invoices.map((i) =>
      InvoiceId.create(new UniqueEntityID(i.invoiceId)).getValue()
    );
  }

  public async getUnrecognizedSageErpInvoices(): Promise<InvoiceId[]> {
    return this.getUnrecognizedInvoices('sage');
  }

  public async getUnrecognizedNetsuiteErpInvoices(): Promise<InvoiceId[]> {
    return this.getUnrecognizedInvoices('netsuite');
  }

  private filterReadyForRegistration(): any {
    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
        .whereNull('invoices.cancelledInvoiceReference')
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

    const invoices = await prepareIdsSQL;

    return invoices.map((i) => {
      return InvoiceId.create(new UniqueEntityID(i.invoiceId)).getValue();
    });
  }

  public async getFailedNetsuiteErpInvoices(): Promise<Invoice[]> {
    return this.getUnregisteredInvoices('netsuite');
  }

  public async getFailedSageErpInvoices(): Promise<Invoice[]> {
    return this.getUnregisteredInvoices('sage');
  }

  async getUnregisteredErpCreditNotes(): Promise<InvoiceId[]> {
    const { db, logger } = this;

    const erpReferencesQuery = db(TABLES.INVOICES)
      .column({ invoiceId: 'invoices.id' })
      .select();

    const withInvoiceItems = this.withInvoicesItemsDetailsQuery();

    const withCreditNoteErpReference = this.withErpReferenceQuery(
      'creditnoteref',
      'invoices.id',
      'invoice',
      'netsuite',
      'creditNote'
    );

    // * SQL for retrieving results needed only for ERP registration
    const filterCreditNotesReadyForERP = this.filterCreditNotesReadyForErpRegistration();

    const prepareIdsSQL = filterCreditNotesReadyForERP(
      withCreditNoteErpReference(withInvoiceItems(erpReferencesQuery))
    );

    logger.debug('select', {
      unregisteredCreditNotes: prepareIdsSQL.toString(),
    });

    const creditNotes = await prepareIdsSQL;

    return creditNotes.map((i) =>
      InvoiceId.create(new UniqueEntityID(i.invoiceId)).getValue()
    );
  }

  async delete(invoice: Invoice): Promise<void> {
    const { db } = this;

    const deletedRows = await db(TABLES.INVOICES)
      .where('id', invoice.id.toString())
      .update({ ...InvoiceMap.toPersistence(invoice), deleted: 1 });

    if (!deletedRows) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoice.id.toString()
      );
    }
  }

  async restore(invoice: Invoice): Promise<void> {
    const { db } = this;

    const restoredRows = await db(TABLES.INVOICES)
      .where('id', invoice.id.toString())
      .update({ ...InvoiceMap.toPersistence(invoice), deleted: 0 });

    if (!restoredRows) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoice.id.toString()
      );
    }
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const { db } = this;
    const updateObject = InvoiceMap.toPersistence(invoice);
    const updated = await db(TABLES.INVOICES)
      .where({ id: invoice.invoiceId.id.toString() })
      .update(updateObject);

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoice.id.toString()
      );
    }

    return invoice;
  }

  async exists(invoice: Invoice): Promise<boolean> {
    try {
      await this.getInvoiceById(invoice.invoiceId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }

  async existsWithId(id: InvoiceId): Promise<boolean> {
    const result = await this.db(TABLES.INVOICES)
      .where('id', id.id.toString())
      .countDistinct({ invoiceCount: 'id' })
      .first();

    return result.invoiceCount !== 0;
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const { db } = this;

    const rawInvoice = InvoiceMap.toPersistence(invoice);

    try {
      await db(TABLES.INVOICES).insert(rawInvoice);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getInvoiceById(invoice.invoiceId);
  }

  async saveBulk(invoices: Invoice[]): Promise<void> {
    for (const invoice of invoices) {
      await this.save(invoice);
    }
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
      .whereNull('cancelledInvoiceReference')
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
}
