/* eslint-disable @typescript-eslint/camelcase */
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
// import { Invoice } from '../../../invoices/domain/Invoice';
import { Waiver, WaiverType } from '../../domain/Waiver';
import { WaiverMap } from '../../mappers/WaiverMap';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import {
  RepoError /*, RepoErrorCode */,
} from '../../../../infrastructure/RepoError';
import { WaiverRepoContract } from '../waiverRepo';
import { InvoiceItemId } from '../../../invoices/domain/InvoiceItemId';

export class KnexWaiverRepo extends AbstractBaseDBRepo<Knex, Waiver>
  implements WaiverRepoContract {
  async getWaiversByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Waiver[]> {
    const waivers = await this.db
      .select()
      .from(TABLES.INVOICE_ITEMS)
      .join(
        TABLES.INVOICE_ITEMS_TO_WAIVERS,
        `${TABLES.INVOICE_ITEMS_TO_WAIVERS}.invoiceItemId`,
        '=',
        `${TABLES.INVOICE_ITEMS}.id`
      )
      .join(
        TABLES.WAIVERS,
        `${TABLES.INVOICE_ITEMS_TO_WAIVERS}.waiverId`,
        '=',
        `${TABLES.WAIVERS}.type_id`
      )
      .where({ [`${TABLES.INVOICE_ITEMS}.id`]: invoiceItemId.id.toString() });

    return waivers.map((w) => WaiverMap.toDomain(w));
  }

  async getWaiversByInvoiceId(invoiceId: InvoiceId): Promise<Waiver[]> {
    const waivers = await this.db
      .select()
      .from(TABLES.INVOICE_ITEMS)
      .where({ [`${TABLES.INVOICE_ITEMS}.invoiceId`]: invoiceId.id.toString() })
      .join(
        TABLES.INVOICE_ITEMS_TO_WAIVERS,
        `${TABLES.INVOICE_ITEMS_TO_WAIVERS}.invoiceItemId`,
        '=',
        `${TABLES.INVOICE_ITEMS}.id`
      )
      .join(
        TABLES.WAIVERS,
        `${TABLES.INVOICE_ITEMS_TO_WAIVERS}.waiverId`,
        '=',
        `${TABLES.WAIVERS}.type_id`
      );

    return waivers.map((w) => WaiverMap.toDomain(w));
  }

  async getWaivers(): Promise<Waiver[]> {
    const waivers = await this.db.select().from(TABLES.WAIVERS);

    return waivers.map((w) => WaiverMap.toDomain(w));
  }

  async attachWaiversToInvoice(
    waiverTypes: WaiverType[],
    invoiceId: InvoiceId,
    dateCreated?: Date
  ): Promise<Waiver[]> {
    if (!waiverTypes.length) {
      return;
    }

    const invoiceItem = await this.db
      .select()
      .from(TABLES.INVOICE_ITEMS)
      .where({
        [`${TABLES.INVOICE_ITEMS}.invoiceId`]: invoiceId.id.toString(),
      })
      .first();

    if (!invoiceItem) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoiceId.id.toString()
      );
    }

    const _existingWaivers = await this.getWaiversByInvoiceId(invoiceId);
    const existingWaivers = _existingWaivers.map((w) => w.waiverType);

    const toInsert = waiverTypes
      .filter((w) => !existingWaivers.includes(w))
      .map((waiverType) => {
        const result = {
          invoiceItemId: invoiceItem.id,
          waiverId: waiverType,
        };

        if (dateCreated) {
          return { ...result, dateCreated };
        }
        return result;
      });

    try {
      await this.db(TABLES.INVOICE_ITEMS_TO_WAIVERS).insert(toInsert);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getWaiversByTypes(waiverTypes);
  }

  async getWaiversByTypes(waiverTypes: WaiverType[]): Promise<Waiver[]> {
    const waivers = await this.db
      .select()
      .from(TABLES.WAIVERS)
      .whereIn('type_id', waiverTypes);

    return waivers.map((w) => WaiverMap.toDomain(w));
  }

  async getWaiverByType(waiverType: WaiverType): Promise<Waiver> {
    const waiver = await this.db
      .select()
      .from(TABLES.WAIVERS)
      .where({ type_id: waiverType })
      .first();

    if (!waiver) {
      throw RepoError.createEntityNotFoundError('waiver', waiverType);
    }

    return waiver;
  }

  async exists(waiver: Waiver): Promise<boolean> {
    try {
      this.getWaiverByType(waiver.waiverType);
    } catch (error) {
      return false;
    }
    return true;
  }

  async save(waiver: Waiver): Promise<Waiver> {
    const { db } = this;

    const rawWaiver = WaiverMap.toPersistence(waiver);

    try {
      await db(TABLES.WAIVERS).insert(rawWaiver);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getWaiverByType(waiver.waiverType);
  }
}
