import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { TransactionId } from './../../../transactions/domain/TransactionId';

import { InvoiceRepoContract } from '../invoiceRepo';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';

import { Bundle, JoinTag } from '../../../../utils/Utils';

function filtered(src: any, filters: Bundle<string, any>) {
  if (filters == null) return src;

  let here = src;
  const invoices = filters.navigate('invoices', 'invoices');
  const article = invoices.navigate('invoiceItem', 'article');
  const journalTitle = article.navigate('journalTitle');
  if (journalTitle.with('in')) {
    here = here[JoinTag(journalTitle)](
      TABLES.JOURNALS,
      `${TABLES.ARTICLES}.journalId`,
      '=',
      `${TABLES.JOURNALS}.id`
    ).whereIn(`${TABLES.JOURNALS}.name`, journalTitle.get('in'));
  }

  const customId = article.navigate('customId');
  if (customId.with('in')) {
    here = here.whereIn(`${TABLES.ARTICLES}.customId`, customId.get('in'));
  }

  const transactionStatus = invoices.navigate('transaction', 'status');
  if (transactionStatus.with('in')) {
    here = here[JoinTag(journalTitle)](
      TABLES.TRANSACTIONS,
      `${TABLES.INVOICES}.transactionId`,
      '=',
      `${TABLES.TRANSACTIONS}.id`
    ).whereIn(`${TABLES.TRANSACTIONS}.status`, transactionStatus.get('in'));
  }

  const status = invoices.navigate('status');
  if (status.with('in')) {
    here = here.whereIn(`${TABLES.INVOICES}.status`, status.get('in'));
  }

  const referenceNumber = invoices.navigate('referenceNumber');
  if (referenceNumber.with('in')) {
    for (const number of referenceNumber.get('in')) {
      const [paddedNumber, creationYear] = number.split('/');
      const invoiceNumber = parseInt(paddedNumber, 10);
      here = here.whereRaw(
        `"${TABLES.INVOICES}"."invoiceNumber" = ${invoiceNumber} and extract(year from "${TABLES.INVOICES}"."dateAccepted") = ${creationYear}`
      );
    }
  }
  return here;
}

export class KnexInvoiceRepo extends AbstractBaseDBRepo<Knex, Invoice>
  implements InvoiceRepoContract {
  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    const { db } = this;

    const invoice = await db(TABLES.INVOICES)
      .select()
      .where('id', invoiceId.id.toString())
      .first();

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

  async getRecentInvoices(
    { limit, offset },
    filters?: Bundle<string, any>
  ): Promise<any> {
    const { db } = this;

    const getModel = () =>
      db(TABLES.INVOICES).whereNot(`${TABLES.INVOICES}.deleted`, 1);
    // .join(
    //   TABLES.INVOICE_ITEMS,
    //   `${TABLES.INVOICES}.id`,
    //   '=',
    //   `${TABLES.INVOICE_ITEMS}.invoiceId`
    // )
    // .join(
    //   TABLES.ARTICLES,
    //   `${TABLES.INVOICE_ITEMS}.manuscriptId`,
    //   '=',
    //   `${TABLES.ARTICLES}.id`
    // );

    const totalCount = await filtered(getModel(), filters).count(
      `${TABLES.INVOICES}.id`
    );
    // const totalCount = await getModel().count(`${TABLES.INVOICES}.id`);

    // console.info('limit = %s, offset = %s', limit, offset);
    const invoices = await getModel()
      .orderBy(`${TABLES.INVOICES}.dateCreated`, 'desc')
      .offset(offset * limit)
      .limit(limit)
      .select();

    //  console.info(invoices);
    // console.info(invoices.map(i => InvoiceMap.toDomain(i)));

    return {
      totalCount: totalCount[0]['count'],
      invoices: invoices.map(i => InvoiceMap.toDomain(i))
    };
  }

  async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const { db } = this;
    const invoices = await db(TABLES.INVOICES)
      .select()
      .where('transactionId', transactionId.id.toString());

    return invoices.map(i => InvoiceMap.toDomain(i));
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
        )
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
      .join('payers', 'payers.invoiceId', '=', 'invoices.id')
      .join('addresses', 'payers.billingAddressId', '=', 'addresses.id')
      .join('payments', 'payments.invoiceId', '=', 'invoices.id')
      .join(
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

  async getFailedErpInvoices(): Promise<Invoice[]> {
    const { db } = this;

    const invoices = await db(TABLES.INVOICES)
      .select()
      .whereNot(`deleted`, 1)
      .where({
        status: 'ACTIVE'
      })
      .whereNull('erpReference');

    return invoices.map(i => InvoiceMap.toDomain(i));
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
}
