/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Transform } from 'stream';
import _ from 'lodash';

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

import { applyFilters } from './utils';

export class KnexInvoiceRepo
  extends AbstractBaseDBRepo<Knex, Invoice>
  implements InvoiceRepoContract {
  constructor(
    protected db: Knex,
    protected logger?: any,
    private models?: any,
    private articleRepo?: ArticleRepoContract,
    private invoiceItemRepo?: InvoiceItemRepoContract
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

  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    const { db, logger } = this;

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
    return InvoiceMap.toDomain(invoice);
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
    // const InvoiceModel = this.models.Invoice;
    // const detailsQuery = this.createBaseDetailsQuery();
    // detailsQuery.offset = offset ? offset : detailsQuery.offset;

    // const invoices = await InvoicesModel.findAll(detailsQuery);

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

  async assignInvoiceNumber(invoiceId: InvoiceId): Promise<Invoice> {
    const { db } = this;

    const invoice = await this.getInvoiceById(invoiceId);
    if (invoice.invoiceNumber) {
      console.log('Invoice number already set');
      return invoice;
    }

    const currentYear = new Date().getFullYear();

    const updated = await db(TABLES.INVOICES)
      .where({ id: invoiceId.id.toString() })
      .update({ dateAccepted: new Date() })
      .update({
        invoiceNumber: db.raw(
          `coalesce((select max("invoiceNumber") + 1 as max from (
          select max("invoiceNumber") as "invoiceNumber" from invoices where "dateAccepted" BETWEEN ? AND ?
            union
            select "invoiceReferenceNumber" as "invoiceNumber" from configurations
          ) referenceNumbers), 1)
        `,
          [`${currentYear}-01-01`, `${currentYear}-12-31`]
        ),
      });

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoiceId.id.toString()
      );
    }

    return this.getInvoiceById(invoiceId);
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

  private filterReadyForSageRevenueRecognition(): any {
    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
        .whereNull('invoices.cancelledInvoiceReference')
        .whereNull('invoices.revenueRecognitionReference')
        .whereNotNull('invoices.erpReference')
        .where('invoices.erpReference', '<>', 'NON_INVOICEABLE')
        .where('invoices.erpReference', '<>', 'MigrationRef')
        .where('invoices.erpReference', '<>', 'migrationRef');
  }

  private filterReadyForNetSuiteRevenueRecognition(): any {
    const { db } = this;
    return (query) =>
      query
        .whereNot('invoices.deleted', 1)
        .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
        .whereNull('invoices.nsRevRecReference')
        .whereNotNull('invoices.nsReference')
        .where('invoices.nsReference', '<>', 'NON_INVOICEABLE')
        .where('invoices.nsReference', '<>', 'MigrationRef')
        .where('invoices.nsReference', '<>', 'migrationRef')
        .whereNotNull('invoices.cancelledInvoiceReference')
        .whereNotIn(
          'invoices.id',
          db.raw(
            `SELECT invoices."cancelledInvoiceReference" from invoices where invoices."cancelledInvoiceReference" is not NULL`
          )
        );
  }

  async getUnrecognizedSageErpInvoices(): Promise<InvoiceId[]> {
    const { logger } = this;

    const detailsQuery = this.createBaseArticleDetailsQuery();

    // * SQL for retrieving results needed only for Sage registration
    const filterInvoicesReadyForSageRevenueRecognition = this.filterReadyForSageRevenueRecognition();

    const filterArticlesByNotNullDatePublished = this.articleRepo.filterBy({
      whereNotNull: 'articles.datePublished',
    });
    const prepareIdsForSageOnlySQL = filterArticlesByNotNullDatePublished(
      filterInvoicesReadyForSageRevenueRecognition(detailsQuery)
    );

    logger.debug('select', {
      SageSQL: prepareIdsForSageOnlySQL.toString(),
    });

    const sageInvoices = await prepareIdsForSageOnlySQL;

    return sageInvoices.map((i) =>
      InvoiceId.create(new UniqueEntityID(i.invoiceId)).getValue()
    );
  }

  async getUnrecognizedNetsuiteErpInvoices(): Promise<InvoiceId[]> {
    const { logger } = this;

    const detailsQuery = this.createBaseArticleDetailsQuery();

    // * SQL for retrieving results needed only for NetSuite registration
    const filterInvoicesReadyForNetSuiteRevenueRecognition = this.filterReadyForNetSuiteRevenueRecognition();

    const filterArticlesByNotNullDatePublished = this.filterBy({
      whereNotNull: 'articles.datePublished',
    });

    const prepareIdsForNetSuiteOnlySQL = filterArticlesByNotNullDatePublished(
      filterInvoicesReadyForNetSuiteRevenueRecognition(detailsQuery)
    );

    logger.debug('select', {
      NetSuiteSQL: prepareIdsForNetSuiteOnlySQL.toString(),
    });

    const netSuiteInvoices = await prepareIdsForNetSuiteOnlySQL;

    return netSuiteInvoices.map((i) =>
      InvoiceId.create(new UniqueEntityID(i.invoiceId)).getValue()
    );
  }

  async getFailedNetsuiteErpInvoices(): Promise<Invoice[]> {
    const { db, logger } = this;
    const LIMIT = 30;

    const sql = db(TABLES.INVOICES)
      .select('invoices.*', 'articles.datePublished')
      .from('invoices')
      .leftJoin('invoice_items', 'invoice_items.invoiceId', '=', 'invoices.id')
      .leftJoin('articles', 'articles.id', '=', 'invoice_items.manuscriptId')
      .where(function () {
        this.whereNot('invoices.deleted', 1)
          .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
          .whereNull('invoices.cancelledInvoiceReference')
          .whereNull('invoices.nsReference');
      })
      .orderBy('articles.datePublished', 'desc')
      .limit(LIMIT);

    logger.debug('select', {
      sql: sql.toString(),
    });

    const invoices = await sql;

    return invoices.map((i) => InvoiceMap.toDomain(i));
  }

  async getFailedSageErpInvoices(): Promise<Invoice[]> {
    const LIMIT = 30;
    const { db, logger } = this;

    const sql = db(TABLES.INVOICES)
      .select('invoices.*', 'articles.datePublished')
      .from('invoices')
      .leftJoin('invoice_items', 'invoice_items.invoiceId', '=', 'invoices.id')
      .leftJoin('articles', 'articles.id', '=', 'invoice_items.manuscriptId')
      .where(function () {
        this.whereNot('invoices.deleted', 1)
          .whereIn('invoices.status', ['ACTIVE', 'FINAL'])
          // .whereNull('invoices.cancelledInvoiceReference')
          .whereNull('invoices.erpReference');
      })
      .orderBy('invoices.dateIssued', 'desc')
      .limit(LIMIT);

    logger.debug('select', {
      sql: sql.toString(),
    });

    const invoices = await sql;

    return invoices.map((i) => InvoiceMap.toDomain(i));
  }

  async delete(invoice: Invoice): Promise<unknown> {
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

    return deletedRows;
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

  async *getInvoicesIds(
    ids: string[],
    journalIds: string[]
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

    const stream = query
      .where('i.deleted', 0)
      .stream({ objectMode: true })
      .pipe(extractInvoiceId);

    for await (const a of stream) {
      yield a;
    }
  }

  filterByInvoiceId(invoiceId: InvoiceId): unknown {
    return (query) =>
      query.where('invoices.id', invoiceId.id.toString()).first();
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
}
