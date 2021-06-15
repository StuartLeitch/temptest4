import { cloneDeep } from 'lodash';

import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { CouponAssignedCollection } from '../../../coupons/domain/CouponAssignedCollection';
import { WaiverAssignedCollection } from '../../../waivers/domain/WaiverAssignedCollection';
import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceId } from '../../domain/InvoiceId';

import { InvoiceItemRepoContract } from '../invoiceItemRepo';
export class MockInvoiceItemRepo
  extends BaseMockRepo<InvoiceItem>
  implements InvoiceItemRepoContract {
  deletedItems: InvoiceItem[] = [];

  constructor() {
    super();
  }

  public async getInvoiceItemById(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem>> {
    const matches = this._items.filter((i) =>
      i.invoiceItemId.equals(invoiceItemId)
    );
    if (matches.length !== 0) {
      const item = cloneDeep(matches[0]);
      item.props.assignedCoupons = CouponAssignedCollection.create();
      item.props.assignedWaivers = WaiverAssignedCollection.create();
      return right(item);
    } else {
      return left(
        RepoError.createEntityNotFoundError(
          'invoiceItem',
          invoiceItemId.toString()
        )
      );
    }
  }

  public async getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<Either<GuardFailure | RepoError, InvoiceItem[]>> {
    const match = cloneDeep(
      this._items.filter((i) => i.manuscriptId.equals(manuscriptId))
    );

    return right(
      match.map((item) => {
        item.props.assignedCoupons = CouponAssignedCollection.create();
        item.props.assignedWaivers = WaiverAssignedCollection.create();
        return item;
      })
    );
  }

  public async getInvoiceItemCollection(): Promise<
    Either<RepoError, InvoiceItem[]>
  > {
    return right(
      this._items.map((item) => {
        const it = cloneDeep(item);
        it.props.assignedCoupons = CouponAssignedCollection.create();
        it.props.assignedWaivers = WaiverAssignedCollection.create();
        return it;
      })
    );
  }

  public async save(
    invoiceItem: InvoiceItem
  ): Promise<Either<RepoError, InvoiceItem>> {
    const item = cloneDeep(invoiceItem);
    item.props.assignedCoupons = CouponAssignedCollection.create();
    item.props.assignedWaivers = WaiverAssignedCollection.create();

    const maybeAlreadyExists = await this.exists(item);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

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

    return right(item);
  }

  public async update(
    invoiceItem: InvoiceItem
  ): Promise<Either<RepoError, InvoiceItem>> {
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

    return right(item);
  }

  public async delete(
    invoiceItem: InvoiceItem
  ): Promise<Either<RepoError, void>> {
    const item = cloneDeep(invoiceItem);
    item.props.assignedCoupons = CouponAssignedCollection.create();
    item.props.assignedWaivers = WaiverAssignedCollection.create();

    this.deletedItems.push(item);

    return right(null);
  }

  public async restore(
    invoiceItem: InvoiceItem
  ): Promise<Either<RepoError, void>> {
    const index = this.deletedItems.findIndex((item) =>
      item.id.equals(invoiceItem.id)
    );
    if (index >= 0) {
      this.deletedItems.splice(index, 1);
    }

    return right(null);
  }

  public async exists(
    invoiceItem: InvoiceItem
  ): Promise<Either<RepoError, boolean>> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, invoiceItem)
    );
    return right(found.length !== 0);
  }

  public compareMockItems(a: InvoiceItem, b: InvoiceItem): boolean {
    return a.id.equals(b.id);
  }

  async getItemsByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<RepoError, InvoiceItem[]>> {
    const matches = cloneDeep(
      this._items.filter((item) => {
        return item.invoiceId.equals(invoiceId);
      })
    );
    return right(
      matches.map((item) => {
        item.props.assignedCoupons = CouponAssignedCollection.create();
        item.props.assignedWaivers = WaiverAssignedCollection.create();
        return item;
      })
    );
  }
}
