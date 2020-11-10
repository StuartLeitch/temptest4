import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { InvoiceItemId } from '../../../invoices/domain/InvoiceItemId';
import { Waiver, WaiverType } from '../../domain/Waiver';

import { WaiverAssignedCollection } from '../../domain/WaiverAssignedCollection';
import { WaiverAssigned } from '../../domain/WaiverAssigned';
import { WaiverRepoContract } from '../waiverRepo';

export class MockWaiverRepo
  extends BaseMockRepo<Waiver>
  implements WaiverRepoContract {
  private invoiceItemToWaiverMapper: {
    [key: string]: UniqueEntityID[];
  } = {};

  constructor() {
    super();
  }

  public async getWaiverById(waiverId: UniqueEntityID): Promise<Waiver> {
    const matches = this._items.filter((i) => i.id.equals(waiverId));
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getWaiversByTypes(waiverTypes: WaiverType[]): Promise<Waiver[]> {
    const resultWaivers: Waiver[] = [];

    for (let index = 0; index < waiverTypes.length; index++) {
      const waiver = await this.getWaiverByType(waiverTypes[index]);
      resultWaivers.push(waiver);
    }
    return resultWaivers;
  }

  public async getWaivers(): Promise<Waiver[]> {
    return this._items;
  }

  public async getWaiverByType(type: WaiverType): Promise<Waiver> {
    const match = this._items.find((item) => item.waiverType === type);
    return match ? match : null;
  }

  public addMockWaiverForInvoiceItem(
    newWaiver: Waiver,
    invoiceItemId: InvoiceItemId
  ): void {
    const invoiceIdValue = invoiceItemId.id.toString();
    if (!this.invoiceItemToWaiverMapper[invoiceIdValue]) {
      this.invoiceItemToWaiverMapper[invoiceIdValue] = [];
    }

    this.invoiceItemToWaiverMapper[invoiceIdValue].push(newWaiver.id);
    this.addMockItem(newWaiver);
  }

  public async getWaiversByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<WaiverAssignedCollection> {
    const waiverIds = this.invoiceItemToWaiverMapper[
      invoiceItemId.id.toString()
    ];
    if (!waiverIds) {
      return WaiverAssignedCollection.create();
    }
    const waivers = this._items.filter((item) => waiverIds.includes(item.id));
    return WaiverAssignedCollection.create(
      waivers.map((i) =>
        WaiverAssigned.create({
          dateAssigned: null,
          invoiceItemId,
          waiver: i,
        })
      )
    );
  }

  public async attachWaiverToInvoiceItem(
    waiverType: WaiverType,
    invoiceItemId: InvoiceItemId
  ): Promise<Waiver> {
    if (!invoiceItemId) {
      return;
    }
    const waiver: Waiver = await this.getWaiverByType(waiverType);

    if (!waiver) {
      return;
    }

    const invoiceIdValue = invoiceItemId.id.toString();
    if (!this.invoiceItemToWaiverMapper[invoiceIdValue]) {
      this.invoiceItemToWaiverMapper[invoiceIdValue] = [];
    }

    this.invoiceItemToWaiverMapper[invoiceIdValue].push(waiver.id);

    return waiver;
  }

  public async removeInvoiceItemWaivers(
    invoiceItemId: InvoiceItemId
  ): Promise<void> {
    delete this.invoiceItemToWaiverMapper[invoiceItemId.id.toValue()];
  }

  public async getWaiverCollection(): Promise<Waiver[]> {
    return this._items; // .filter(i => i.invoiceId.id.toString() === invoiceId);
  }

  public async save(waiver: Waiver): Promise<Waiver> {
    const alreadyExists = await this.exists(waiver);

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, waiver)) {
          return waiver;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(waiver);
    }

    return waiver;
  }

  public async update(waiver: Waiver): Promise<Waiver> {
    const alreadyExists = await this.exists(waiver);

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, waiver)) {
          return waiver;
        } else {
          return i;
        }
      });
    }

    return waiver;
  }

  public async delete(waiver: Waiver): Promise<void> {
    this.removeMockItem(waiver);
  }

  public async exists(waiver: Waiver): Promise<boolean> {
    const found = this._items.filter((i) => this.compareMockItems(i, waiver));
    return found.length !== 0;
  }

  public compareMockItems(a: Waiver, b: Waiver): boolean {
    return a.id.equals(b.id);
  }
}
