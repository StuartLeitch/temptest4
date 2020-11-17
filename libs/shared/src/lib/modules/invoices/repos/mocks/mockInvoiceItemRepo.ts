import { cloneDeep } from 'lodash';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { InvoiceItemRepoContract } from '../invoiceItemRepo';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { ManuscriptId } from '../../domain/ManuscriptId';
import { InvoiceId } from '../../domain/InvoiceId';
import { CouponAssignedCollection } from '../../../coupons/domain/CouponAssignedCollection';
import { WaiverAssignedCollection } from '../../../waivers/domain/WaiverAssignedCollection';

export class MockInvoiceItemRepo
  extends BaseMockRepo<InvoiceItem>
  implements InvoiceItemRepoContract {
  deletedItems: InvoiceItem[] = [];

  constructor() {
    super();
  }

  public async getInvoiceItemById(
    invoiceItemId: InvoiceItemId
  ): Promise<InvoiceItem> {
    const matches = this._items.filter((i) =>
      i.invoiceItemId.equals(invoiceItemId)
    );
    if (matches.length !== 0) {
      const item = cloneDeep(matches[0]);
      item.props.assignedCoupons = CouponAssignedCollection.create();
      item.props.assignedWaivers = WaiverAssignedCollection.create();
      return item;
    } else {
      return null;
    }
  }

  public async getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<InvoiceItem[]> {
    const match = cloneDeep(
      this._items.filter((i) => i.manuscriptId.equals(manuscriptId))
    );
    return match.map((item) => {
      item.props.assignedCoupons = CouponAssignedCollection.create();
      item.props.assignedWaivers = WaiverAssignedCollection.create();
      return item;
    });
  }

  public async getInvoiceItemCollection(): Promise<InvoiceItem[]> {
    return this._items.map((item) => {
      const it = cloneDeep(item);
      it.props.assignedCoupons = CouponAssignedCollection.create();
      it.props.assignedWaivers = WaiverAssignedCollection.create();
      return it;
    });
  }

  public async save(invoiceItem: InvoiceItem): Promise<InvoiceItem> {
    const item = cloneDeep(invoiceItem);
    item.props.assignedCoupons = CouponAssignedCollection.create();
    item.props.assignedWaivers = WaiverAssignedCollection.create();

    const alreadyExists = await this.exists(item);

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, item)) {
          return item;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(item);
    }

    return item;
  }

  public async update(invoiceItem: InvoiceItem): Promise<InvoiceItem> {
    const item = cloneDeep(invoiceItem);
    item.props.assignedCoupons = CouponAssignedCollection.create();
    item.props.assignedWaivers = WaiverAssignedCollection.create();

    const alreadyExists = await this.exists(item);

    if (alreadyExists) {
      this._items = this._items.map((i) => {
        if (this.compareMockItems(i, item)) {
          return item;
        } else {
          return i;
        }
      });
    }

    return item;
  }

  public async delete(invoiceItem: InvoiceItem): Promise<void> {
    const item = cloneDeep(invoiceItem);
    item.props.assignedCoupons = CouponAssignedCollection.create();
    item.props.assignedWaivers = WaiverAssignedCollection.create();

    this.deletedItems.push(item);
  }

  public async restore(invoiceItem: InvoiceItem): Promise<void> {
    const index = this.deletedItems.findIndex((item) =>
      item.id.equals(invoiceItem.id)
    );
    if (index >= 0) {
      this.deletedItems.splice(index, 1);
    }
  }

  public async exists(invoiceItem: InvoiceItem): Promise<boolean> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, invoiceItem)
    );
    return found.length !== 0;
  }

  public compareMockItems(a: InvoiceItem, b: InvoiceItem): boolean {
    return a.id.equals(b.id);
  }

  async getItemsByInvoiceId(invoiceId: InvoiceId): Promise<InvoiceItem[]> {
    const matches = cloneDeep(
      this._items.filter((item) => {
        // console.log(item);
        return item.invoiceId.equals(invoiceId);
      })
    );
    // console.log(matches);
    return matches.map((item) => {
      item.props.assignedCoupons = CouponAssignedCollection.create();
      item.props.assignedWaivers = WaiverAssignedCollection.create();
      return item;
    });
  }
}
