import {Knex} from '@hindawi/shared';

import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {InvoiceItem} from '../../domain/InvoiceItem';
import {InvoiceItemId} from '../../domain/InvoiceItemId';
import {InvoiceItemMap} from '../../mappers/InvoiceItemMap';
// import {TransactionId} from './../../../transactions/domain/TransactionId';

import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError, RepoErrorCode} from '../../../../infrastructure/RepoError';
import {InvoiceItemRepoContract} from '../invoiceItemRepo';

export class KnexInvoiceItemRepo extends AbstractBaseDBRepo<Knex, InvoiceItem>
  implements InvoiceItemRepoContract {
  async getInvoiceItemById(invoiceItemId: InvoiceItemId): Promise<InvoiceItem> {
    const {db} = this;

    const invoiceItem = await db('invoice_items')
      .select()
      .where('id', invoiceItemId.id.toString())
      .first();

    if (!invoiceItem) {
      throw RepoError.createEntityNotFoundError(
        'invoiceItem',
        invoiceItemId.id.toString()
      );
    }

    return InvoiceItemMap.toDomain(invoiceItem);
  }

  // async getInvoicesByTransactionId(
  //   transactionId: TransactionId
  // ): Promise<Invoice[]> {
  //   const {db} = this;
  //   const invoices = await db('invoices')
  //     .select()
  //     .where('transactionId', transactionId.id.toString());

  //   return invoices.map(i => InvoiceMap.toDomain(i));
  // }

  async delete(invoiceItem: InvoiceItem): Promise<unknown> {
    const {db} = this;

    const deletedRows = await db('invoices')
      .where('id', invoiceItem.id.toString())
      .update({...InvoiceItemMap.toPersistence(invoiceItem), deleted: 1});

    if (!deletedRows) {
      throw RepoError.createEntityNotFoundError(
        'invoiceItem',
        invoiceItem.id.toString()
      );
    }

    return deletedRows;
  }

  // async update(invoice: Invoice): Promise<Invoice> {
  //   const {db} = this;

  //   const updated = await db('invoices')
  //     .where({id: invoice.id.toString()})
  //     .update({
  //       status: invoice.status,
  //       // totalAmount: invoice.totalAmount,
  //       // netAmount: invoice.netAmount,
  //       dateCreated: invoice.dateCreated,
  //       transactionId: invoice.transactionId.id.toString()
  //     });

  //   if (!updated) {
  //     throw RepoError.createEntityNotFoundError(
  //       'invoice',
  //       invoice.id.toString()
  //     );
  //   }

  //   return invoice;
  // }

  async exists(invoiceItem: InvoiceItem): Promise<boolean> {
    try {
      await this.getInvoiceItemById(invoiceItem.invoiceItemId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }

  async save(invoiceItem: InvoiceItem): Promise<InvoiceItem> {
    const {db} = this;

    const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);

    try {
      await db('invoice_items').insert(rawInvoiceItem);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getInvoiceItemById(invoiceItem.invoiceItemId);
  }

  // static makeId(id: string): InvoiceId {
  //   return InvoiceId.create(new UniqueEntityID(id));
  // }
}
