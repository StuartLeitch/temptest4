import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Either, left, right } from '../../../../core/logic/Either';

import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceErpReferences } from './../../../invoices/domain/InvoiceErpReferences';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { ErpReference } from '../../domain/ErpReference';

import { InvoiceMap } from './../../../invoices/mappers/InvoiceMap';

import { ErpReferenceRepoContract } from '../ErpReferenceRepo';

export class MockErpReferenceRepo
  extends BaseMockRepo<ErpReference>
  implements ErpReferenceRepoContract {
  deletedItems: ErpReference[] = [];

  constructor() {
    super();
  }

  public async getErpReferencesByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, InvoiceErpReferences>> {
    const match = this._items.find(() =>
      this._items.some((ef) => ef.entity_id === invoiceId.id.toString())
    );

    const invoice = InvoiceMap.toDomain({
      erpReferences: match,
    });

    return invoice.map((i) => i.getErpReferences());
  }

  public async getErpReferenceById(
    id: UniqueEntityID
  ): Promise<Either<GuardFailure | RepoError, ErpReference>> {
    const result = this._items.find((i) => i.entity_id === id.toString());

    if (ErpReference) {
      return right(result);
    } else {
      return left(
        RepoError.createEntityNotFoundError('erp reference', id.toString())
      );
    }
  }

  public async getErpReferencesById(
    ids: UniqueEntityID[]
  ): Promise<Either<GuardFailure | RepoError, ErpReference[]>> {
    const rawIds = ids.map((i) => i.toString());
    const result = this._items.filter((i) => rawIds.indexOf(i.entity_id) >= 0);

    if (result.length > 0) {
      return right(result);
    } else {
      return left(
        RepoError.createEntityNotFoundError('erp references', rawIds.join(' '))
      );
    }
  }

  public async exists(
    erpReference: ErpReference
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, erpReference)
    );
    return right(found.length !== 0);
  }

  public async save(
    erpReference: ErpReference
  ): Promise<Either<GuardFailure | RepoError, ErpReference>> {
    const maybeAlreadyExists = await this.exists(erpReference);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, erpReference)) {
          return erpReference;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(erpReference);
    }

    return right(erpReference);
  }

  public compareMockItems(a: ErpReference, b: ErpReference): boolean {
    return a.equals(b);
  }

  public filterBy(criteria): ErpReference[] {
    // * All these must return true
    const conditionsMap = {
      whereNotNull: (value) => value !== null,
      whereNull: (value) => value === null,
      whereNot: (value, valueNot) => value !== valueNot,
      whereIn: (value, ins) => ins.includes(value),
      where: (field, operator, value) => {
        if (operator === '<>') {
          return field !== value;
        }
        if (operator === '=') {
          return field === value;
        }
      },
    };

    let items = this._items;

    for (const [filter, conditions] of Object.entries(criteria)) {
      items = items.filter((i) => {
        let toKeep = true;
        for (const cnd of conditions as any[]) {
          if (!toKeep) {
            break;
          }

          if (filter === 'whereIn' || filter === 'whereNot') {
            const [field, values] = cnd;
            toKeep = conditionsMap[filter].call(i, i[field], values);
          } else if (filter === 'whereNull' || filter === 'whereNotNull') {
            let field = cnd;
            if (Array.isArray(cnd)) {
              [field] = cnd;
            }
            toKeep = conditionsMap[filter].call(i, i[field]);
          } else if (filter === 'where') {
            const [field, operator, value] = cnd;
            toKeep = conditionsMap[filter].call(i, i[field], operator, value);
          } else {
            toKeep = conditionsMap[filter].call(i, cnd);
          }
        }
        return toKeep;
      });
    }

    return items;
  }
}
