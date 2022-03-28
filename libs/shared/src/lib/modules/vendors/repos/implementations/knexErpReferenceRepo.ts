import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import {TABLES } from '../../../../infrastructure/database/knex';
import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceErpReferences } from './../../../invoices/domain/InvoiceErpReferences';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { ErpReferenceMap } from './../../mapper/ErpReference';
import { ErpReference } from '../../domain/ErpReference';

import { ErpReferenceRepoContract } from '../ErpReferenceRepo';
import Knex from "knex";

export class KnexErpReferenceRepo
  extends AbstractBaseDBRepo<Knex, ErpReference>
  implements ErpReferenceRepoContract {
  public async getErpReferencesByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, InvoiceErpReferences>> {
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

    try {
      const erpReferences = await sql;

      return flatten(erpReferences.map(ErpReferenceMap.toDomain)).map(
        InvoiceErpReferences.create
      );
    } catch (e) {
      return left(
        RepoError.createEntityNotFoundError(
          'invoiceId',
          typeof invoiceId === 'string' ? invoiceId : invoiceId.id.toString()
        )
      );
    }
  }

  public async getErpReferencesById(
    ids: UniqueEntityID[]
  ): Promise<Either<GuardFailure | RepoError, ErpReference[]>> {
    const { db, logger } = this;
    const idList = ids.map((i) => i.toString());

    const sql = db(TABLES.ERP_REFERENCES).select().whereIn('entity_id', idList);

    logger.debug('select', {
      sql: sql.toString(),
    });

    try {
      const erpReferences = await sql;

      return flatten(erpReferences.map(ErpReferenceMap.toDomain));
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }
  }

  public async getErpReferenceById(
    id: UniqueEntityID
  ): Promise<Either<GuardFailure | RepoError, ErpReference>> {
    const { db, logger } = this;

    const sql = db(TABLES.ERP_REFERENCES)
      .select()
      .where('entity_id', id.toString())
      .first();

    logger.debug('select', {
      sql: sql.toString(),
    });

    try {
      const erpReference = await sql;

      return ErpReferenceMap.toDomain(erpReference);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }
  }

  async exists(
    erpReference: ErpReference
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    return left(RepoError.methodNotImplemented('knexErpReferenceRepo.exists'));
  }

  async save(
    erpReference: ErpReference
  ): Promise<Either<GuardFailure | RepoError, ErpReference>> {
    const { db } = this;
    const rawErpReference = ErpReferenceMap.toPersistence(erpReference);
    try {
      await db(TABLES.ERP_REFERENCES).insert(rawErpReference);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return this.getErpReferenceById(new UniqueEntityID(erpReference.entity_id));
  }
}
