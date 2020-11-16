import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { ErpReferenceRepoContract } from '../ErpReferenceRepo';
import { ErpReference } from '../../domain/ErpReference';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceErpReferences } from './../../../invoices/domain/InvoiceErpReferences';
import { InvoiceMap } from './../../../invoices/mappers/InvoiceMap';

export class MockErpReferenceRepo
  extends BaseMockRepo<ErpReference>
  implements ErpReferenceRepoContract {
  deletedItems: ErpReference[] = [];

  constructor() {
    super();
  }

  public async getErpReferencesByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<InvoiceErpReferences> {
    const match = this._items.find(() =>
      this._items.some((ef) => ef.entity_id === invoiceId.id.toString())
    );

    const invoice = InvoiceMap.toDomain({
      erpReferences: match,
    });

    return invoice.getErpReferences() ?? null;
  }

  public async exists(erpReference: ErpReference): Promise<boolean> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, erpReference)
    );
    return found.length !== 0;
  }

  public async delete(erpReference: ErpReference): Promise<void> {
    this.deletedItems.push(erpReference);
  }

  public async save(erpReference: ErpReference): Promise<ErpReference> {
    const alreadyExists = await this.exists(erpReference);

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

    return erpReference;
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
      },
    };

    const items = this._items;

    for (const [filter, conditions] of Object.entries(criteria)) {
      items.filter((i) => {
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
