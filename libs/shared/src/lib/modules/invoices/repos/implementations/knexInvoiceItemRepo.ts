import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';

import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { ManuscriptId } from '../../domain/ManuscriptId';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { InvoiceItemRepoContract } from '../invoiceItemRepo';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';

export class KnexInvoiceItemRepo extends AbstractBaseDBRepo<Knex, InvoiceItem>
  implements InvoiceItemRepoContract {
  async getInvoiceItemById(invoiceItemId: InvoiceItemId): Promise<InvoiceItem> {
    const { db } = this;

    const invoiceItem = await db(TABLES.INVOICE_ITEMS)
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
  ): Promise<InvoiceItem[]> {
    const { db, logger } = this;
    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    const sql = db(TABLES.INVOICE_ITEMS)
      .select()
      .where('manuscriptId', manuscriptId.id.toString());

    logger.debug('select', {
      correlationId,
      sql: sql.toString(),
    });

    let invoiceItems;
    try {
      invoiceItems = await sql;
    } catch (e) {
      throw RepoError.createEntityNotFoundError(
        'manuscriptId',
        typeof manuscriptId === 'string'
          ? manuscriptId
          : manuscriptId.id.toString()
      );
    }

    return invoiceItems.map(InvoiceItemMap.toDomain);
  }

  async update(invoiceItem: InvoiceItem): Promise<InvoiceItem> {
    const { db } = this;

    const updated = await db(TABLES.INVOICE_ITEMS)
      .where({ id: invoiceItem.invoiceItemId.id.toString() })
      .update({
        dateCreated: invoiceItem.dateCreated,
        invoiceId: invoiceItem.invoiceId.id.toString(),
        vat: invoiceItem.vat,
        price: invoiceItem.price,
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
    const { db } = this;

    const deletedRows = await db(TABLES.INVOICE_ITEMS)
      .where('id', invoiceItem.id.toString())
      .update({ ...InvoiceItemMap.toPersistence(invoiceItem), deleted: 1 });

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
    const { db } = this;

    const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);

    try {
      await db(TABLES.INVOICE_ITEMS).insert(rawInvoiceItem);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getInvoiceItemById(invoiceItem.invoiceItemId);
  }

  getInvoiceItemCollection(): Promise<InvoiceItem[] | any> {
    return Promise.resolve(42);
  }

  async getItemsByInvoiceId(invoiceId: InvoiceId): Promise<InvoiceItem[]> {
    const { db } = this;

    const items = await db(TABLES.INVOICE_ITEMS)
      .select()
      .where('invoiceId', invoiceId.id.toString());

    if (!items) {
      throw RepoError.createEntityNotFoundError(
        'invoice-items',
        invoiceId.id.toString()
      );
    }

    return items.map((item) => InvoiceItemMap.toDomain(item));
  }
}
