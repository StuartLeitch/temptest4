import {Knex} from '@hindawi/shared';

import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {InvoiceItem} from '../../domain/InvoiceItem';
import {InvoiceItemId} from '../../domain/InvoiceItemId';
import {InvoiceItemMap} from '../../mappers/InvoiceItemMap';
// import {TransactionId} from './../../../transactions/domain/TransactionId';

import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError, RepoErrorCode} from '../../../../infrastructure/RepoError';
import {InvoiceItemRepoContract} from '../invoiceItemRepo';
import {ManuscriptId} from '../../domain/ManuscriptId';

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
        'invoice item',
        invoiceItemId.id.toString()
      );
    }

    return InvoiceItemMap.toDomain(invoiceItem);
  }

  public async getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<InvoiceItem> {
    const {db} = this;
    const invoice = await db('invoice_items')
      .select()
      .where('manuscriptId', manuscriptId.id.toString())
      .first();

    return InvoiceItemMap.toDomain(invoice);
  }

  async update(invoiceItem: InvoiceItem): Promise<InvoiceItem> {
    const {db} = this;

    const updated = await db('invoice_items')
      .where({id: invoiceItem.invoiceItemId.id.toString()})
      .update({
        dateCreated: invoiceItem.dateCreated,
        invoiceId: invoiceItem.invoiceId.id.toString()
      });

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'invoice item',
        invoiceItem.id.toString()
      );
    }

    return invoiceItem;
  }

  async delete(invoiceItem: InvoiceItem): Promise<void> {
    const {db} = this;

    const deletedRows = await db('invoice_items')
      .where('id', invoiceItem.id.toString())
      .update({...InvoiceItemMap.toPersistence(invoiceItem), deleted: 1});

    if (!deletedRows) {
      throw RepoError.createEntityNotFoundError(
        'invoice item',
        invoiceItem.id.toString()
      );
    }
  }

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

  getInvoiceItemCollection(): Promise<InvoiceItem[] | any> {
    return Promise.resolve(42);
  }

  getItemsByInvoiceId(): Promise<InvoiceItem[] | any> {
    return Promise.resolve(42);
  }
}
