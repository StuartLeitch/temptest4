/* eslint-disable @typescript-eslint/no-unused-vars */

import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { ErpReference } from '../../domain/ErpReference';
import { ErpReferenceRepoContract } from '../ErpReferenceRepo';
import { InvoiceErpReferences } from './../../../invoices/domain/InvoiceErpReferences';
import { ErpReferenceMap } from './../../mapper/ErpReference';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';

export class KnexErpReferenceRepo
  extends AbstractBaseDBRepo<Knex, ErpReference>
  implements ErpReferenceRepoContract {
  public async getErpReferencesByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<InvoiceErpReferences> {
    const { db, logger } = this;
    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    const sql = db(TABLES.ERP_REFERENCES)
      .select()
      .where('entity_id', invoiceId.id.toString());

    logger.debug('select', {
      correlationId,
      sql: sql.toString(),
    });

    let erpReferences;
    try {
      erpReferences = await sql;
    } catch (e) {
      throw RepoError.createEntityNotFoundError(
        'invoiceId',
        typeof invoiceId === 'string' ? invoiceId : invoiceId.id.toString()
      );
    }

    return InvoiceErpReferences.create(
      erpReferences.map((ef) => ErpReferenceMap.toDomain(ef))
    );
  }

  public async getErpReferenceById(
    ids: UniqueEntityID[]
  ): Promise<ErpReference> {
    const { db, logger } = this;
    const idList = ids.map((i) => i.toString());

    const sql = db(TABLES.ERP_REFERENCES).select().whereIn('entity_id', idList);

    logger.debug('select', {
      sql: sql.toString(),
    });

    let erpReferences;
    try {
      erpReferences = await sql;
    } catch (e) {
      throw new Error(e.message);
    }
    return erpReferences;
  }

  async delete(erpReference: ErpReference): Promise<void> {
    // * do nothing yet!
  }

  async exists(erpReference: ErpReference): Promise<boolean> {
    return false;
  }

  async save(erpReference: ErpReference): Promise<ErpReference> {
    const { db } = this;
    const rawErpReference = ErpReferenceMap.toPersistence(erpReference);
    try {
      await db(TABLES.ERP_REFERENCES).insert(rawErpReference);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }
    return erpReference;
  }
}
