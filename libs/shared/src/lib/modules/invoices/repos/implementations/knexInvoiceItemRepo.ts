import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceId } from '../../domain/InvoiceId';

import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';

import { InvoiceItemRepoContract } from '../invoiceItemRepo';

export class KnexInvoiceItemRepo
  extends AbstractBaseDBRepo<Knex, InvoiceItem>
  implements InvoiceItemRepoContract {
  async getInvoiceItemById(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem>> {
    const { db } = this;

    const invoiceItem = await db(TABLES.INVOICE_ITEMS)
      .select()
      .where('id', invoiceItemId.id.toString())
      .first();

    if (!invoiceItem) {
      return left(
        RepoError.createEntityNotFoundError(
          'invoice item',
          invoiceItemId.id.toString()
        )
      );
    }

    return InvoiceItemMap.toDomain(invoiceItem);
  }

  public async getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem[]>> {
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
      return left(
        RepoError.createEntityNotFoundError(
          'manuscriptId',
          typeof manuscriptId === 'string'
            ? manuscriptId
            : manuscriptId.id.toString()
        )
      );
    }

    return flatten(invoiceItems.map(InvoiceItemMap.toDomain));
  }

  async update(
    invoiceItem: InvoiceItem
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem>> {
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
      return left(
        RepoError.createEntityNotFoundError(
          'invoice item',
          invoiceItem.id.toString()
        )
      );
    }

    return this.getInvoiceItemById(invoiceItem.invoiceItemId);
  }

  async delete(invoiceItem: InvoiceItem): Promise<Either<RepoError, void>> {
    const { db } = this;

    const deletedRows = await db(TABLES.INVOICE_ITEMS)
      .where('id', invoiceItem.id.toString())
      .update({ ...InvoiceItemMap.toPersistence(invoiceItem), deleted: 1 });

    if (!deletedRows) {
      return left(
        RepoError.createEntityNotFoundError(
          'invoice item',
          invoiceItem.id.toString()
        )
      );
    }

    return right(null);
  }

  async restore(invoiceItem: InvoiceItem): Promise<Either<RepoError, void>> {
    const { db } = this;

    const restoredRows = await db(TABLES.INVOICE_ITEMS)
      .where('id', invoiceItem.id.toString())
      .update({ ...InvoiceItemMap.toPersistence(invoiceItem), deleted: 0 });

    if (!restoredRows) {
      return left(
        RepoError.createEntityNotFoundError(
          'invoice item',
          invoiceItem.id.toString()
        )
      );
    }

    return right(null);
  }

  async exists(invoiceItem: InvoiceItem): Promise<Either<RepoError, boolean>> {
    try {
      await this.getInvoiceItemById(invoiceItem.invoiceItemId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }

      return left(RepoError.fromDBError(e));
    }

    return right(true);
  }

  async save(
    invoiceItem: InvoiceItem
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem>> {
    const { db } = this;

    const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);

    try {
      await db(TABLES.INVOICE_ITEMS).insert(rawInvoiceItem);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return this.getInvoiceItemById(invoiceItem.invoiceItemId);
  }

  async getInvoiceItemCollection(): Promise<
    Either<GuardFailure, InvoiceItem[]>
  > {
    const { db, logger } = this;

    const sql = db(TABLES.INVOICE_ITEMS).select();

    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    logger.debug('getItemsByInvoiceId', {
      correlationId,
      sql: sql.toString(),
    });

    const items = await sql;

    return flatten(items.map((item) => InvoiceItemMap.toDomain(item)));
  }

  async getItemsByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem[]>> {
    const { db, logger } = this;

    const sql = db(TABLES.INVOICE_ITEMS)
      .select()
      .where('invoiceId', invoiceId.id.toString());

    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    logger.debug('getItemsByInvoiceId', {
      correlationId,
      sql: sql.toString(),
    });

    const items = await sql;

    if (!items) {
      return left(
        RepoError.createEntityNotFoundError(
          'invoice-items',
          invoiceId.id.toString()
        )
      );
    }

    return flatten(items.map((item) => InvoiceItemMap.toDomain(item)));
  }
}
