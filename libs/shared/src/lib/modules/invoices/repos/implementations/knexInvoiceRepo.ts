import {Knex} from '@hindawi/shared';

import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Invoice} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {InvoiceItemId} from '../../domain/InvoiceItemId';
import {InvoiceMap} from '../../mappers/InvoiceMap';
import {TransactionId} from './../../../transactions/domain/TransactionId';

import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError, RepoErrorCode} from '../../../../infrastructure/RepoError';
import {InvoiceRepoContract} from '../invoiceRepo';

export class KnexInvoiceRepo extends AbstractBaseDBRepo<Knex, Invoice>
  implements InvoiceRepoContract {
  public async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    const {db} = this;

    const invoice = await db('invoices')
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
    const {db} = this;

    const invoice = await db('invoice_items')
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

  async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const {db} = this;
    const invoices = await db('invoices')
      .select()
      .where('transactionId', transactionId.id.toString());

    return invoices.map(i => InvoiceMap.toDomain(i));
  }

  async delete(invoice: Invoice): Promise<unknown> {
    const {db} = this;

    const deletedRows = await db('invoices')
      .where('id', invoice.id.toString())
      .update({...InvoiceMap.toPersistence(invoice), deleted: 1});

    if (!deletedRows) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoice.id.toString()
      );
    }

    return deletedRows;
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const {db} = this;

    const updated = await db('invoices')
      .where({id: invoice.invoiceId.id.toString()})
      .update({
        status: invoice.status,
        dateCreated: invoice.dateCreated,
        transactionId: invoice.transactionId.id.toString()
      });

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
    const {db} = this;

    const rawInvoice = InvoiceMap.toPersistence(invoice);

    try {
      await db('invoices').insert(rawInvoice);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getInvoiceById(invoice.invoiceId);
  }
}
