import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { RepoError } from '../../../../infrastructure/RepoError';

import { WaiverAssignedCollection } from '../../domain/WaiverAssignedCollection';
import { InvoiceItemId } from '../../../invoices/domain/InvoiceItemId';
import { WaiverType, Waiver } from '../../domain/Waiver';

import { WaiverMap } from '../../mappers/WaiverMap';

import { WaiverRepoContract } from '../waiverRepo';

export class KnexWaiverRepo
  extends AbstractBaseDBRepo<Knex, Waiver>
  implements WaiverRepoContract {
  async getWaiversByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, WaiverAssignedCollection>> {
    const waivers = await this.db
      .select(
        `${TABLES.INVOICE_ITEMS_TO_WAIVERS}.dateCreated as dateAssigned`,
        `${TABLES.INVOICE_ITEMS_TO_WAIVERS}.invoiceItemId`,
        `${TABLES.WAIVERS}.reduction`,
        `${TABLES.WAIVERS}.isActive`,
        `${TABLES.WAIVERS}.metadata`,
        `${TABLES.WAIVERS}.type_id`
      )
      .from(TABLES.INVOICE_ITEMS_TO_WAIVERS)
      .join(
        TABLES.WAIVERS,
        `${TABLES.INVOICE_ITEMS_TO_WAIVERS}.waiverId`,
        '=',
        `${TABLES.WAIVERS}.type_id`
      )
      .where({
        [`${TABLES.INVOICE_ITEMS_TO_WAIVERS}.invoiceItemId`]: invoiceItemId.id.toString(),
      });

    return WaiverMap.toDomainCollection(waivers);
  }

  async getWaivers(): Promise<Either<GuardFailure | RepoError, Waiver[]>> {
    const waivers = await this.db.select().from(TABLES.WAIVERS);

    return flatten(waivers.map((w) => WaiverMap.toDomain(w)));
  }

  async attachWaiverToInvoiceItem(
    waiverType: WaiverType,
    invoiceItemId: InvoiceItemId,
    dateCreated?: Date
  ): Promise<Either<GuardFailure | RepoError, Waiver>> {
    let toInsert: any = {
      invoiceItemId: invoiceItemId.id.toString(),
      waiverId: waiverType,
    };

    if (dateCreated) {
      toInsert = { ...toInsert, dateCreated };
    }

    try {
      console.log(JSON.stringify(toInsert, null, 2));
      await this.db(TABLES.INVOICE_ITEMS_TO_WAIVERS).insert(toInsert);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    const result = await this.getWaiversByTypes([waiverType]);

    if (result.isRight()) {
      return right(result.value[0]);
    } else {
      return left(result.value);
    }
  }

  async removeInvoiceItemWaivers(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const itemsIds = [invoiceItemId.id.toString()];
    try {
      await this.db(TABLES.INVOICE_ITEMS_TO_WAIVERS)
        .whereIn('invoiceItemId', itemsIds)
        .del();
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return right(null);
  }

  async getWaiversByTypes(
    waiverTypes: WaiverType[]
  ): Promise<Either<GuardFailure | RepoError, Waiver[]>> {
    const waivers = await this.db
      .select()
      .from(TABLES.WAIVERS)
      .whereIn('type_id', waiverTypes);

    return flatten(waivers.map((w) => WaiverMap.toDomain(w)));
  }

  async getWaiverByType(
    waiverType: WaiverType
  ): Promise<Either<GuardFailure | RepoError, Waiver>> {
    const waiver = await this.db
      .select()
      .from(TABLES.WAIVERS)
      .where({ type_id: waiverType })
      .first();

    if (!waiver) {
      return left(RepoError.createEntityNotFoundError('waiver', waiverType));
    }

    return WaiverMap.toDomain(waiver);
  }

  async exists(
    waiver: Waiver
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      this.getWaiverByType(waiver.waiverType);
    } catch (error) {
      return right(false);
    }
    return right(true);
  }

  async save(
    waiver: Waiver
  ): Promise<Either<GuardFailure | RepoError, Waiver>> {
    const { db } = this;

    const rawWaiver = WaiverMap.toPersistence(waiver);

    try {
      await db(TABLES.WAIVERS).insert(rawWaiver);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return this.getWaiverByType(waiver.waiverType);
  }
}
