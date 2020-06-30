import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { WaiverRepoContract } from '../waiverRepo';
import { Waiver, WaiverType } from '../../domain/Waiver';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceItemId } from '../../../invoices/domain/InvoiceItemId';
// import {TransactionId} from '../../../transactions/domain/TransactionId';

export class MockWaiverRepo extends BaseMockRepo<Waiver>
  implements WaiverRepoContract {
  private invoiceItemToWaiverMapper: {
    [key: string]: UniqueEntityID[];
  } = {};

  private invoiceToInvoiceItemMapper: {
    [key: string]: string[];
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
  ) {
    const invoiceIdValue = invoiceItemId.id.toString();
    if (!this.invoiceItemToWaiverMapper[invoiceIdValue]) {
      this.invoiceItemToWaiverMapper[invoiceIdValue] = [];
    }

    this.invoiceItemToWaiverMapper[invoiceIdValue].push(newWaiver.id);
    this._items.push(newWaiver);
  }

  public addMockInvoiceItemToInvoice(
    invoiceId: InvoiceId,
    invoiceItemId: InvoiceItemId
  ) {
    const invoiceIdValue = invoiceId.id.toString();
    const invoiceItemIdValue = invoiceItemId.id.toString();
    if (!this.invoiceToInvoiceItemMapper[invoiceIdValue]) {
      this.invoiceToInvoiceItemMapper[invoiceIdValue] = [];
    }
    this.invoiceToInvoiceItemMapper[invoiceIdValue].push(invoiceItemIdValue);
  }

  public async getWaiversByInvoiceId(invoiceId: InvoiceId): Promise<Waiver[]> {
    const invoiceIdValue = invoiceId.id.toString();
    const invoiceItemIds = this.invoiceToInvoiceItemMapper[invoiceIdValue];
    if (invoiceItemIds) {
      const waiversIds: UniqueEntityID[] = [];
      invoiceItemIds.map((id) =>
        waiversIds.push(...this.invoiceItemToWaiverMapper[id])
      );
      const waivers: Waiver[] = [];
      for (let index = 0; index < waiversIds.length; index++) {
        const waiver = await this.getWaiverById(waiversIds[index]);
        waivers.push(waiver);
      }
      return waivers;
    }
    return [];
  }

  public async getWaiversByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Waiver[]> {
    const waiverIds = this.invoiceItemToWaiverMapper[
      invoiceItemId.id.toString()
    ];
    if (!waiverIds) {
      return [];
    }
    return this._items.filter((item) => waiverIds.includes(item.id));
  }

  public async attachWaiverToInvoice(
    waiverType: WaiverType,
    invoiceId: InvoiceId
  ): Promise<Waiver> {
    const invoiceItemIds = this.invoiceToInvoiceItemMapper[
      invoiceId.id.toString()
    ];
    if (!invoiceItemIds) {
      return;
    }
    const waiver: Waiver = await this.getWaiverByType(waiverType);

    if (!waiver) {
      return;
    }

    invoiceItemIds.map((id) => {
      const invoiceIdObject = InvoiceItemId.create(new UniqueEntityID(id));
      this.addMockWaiverForInvoiceItem(waiver, invoiceIdObject);
    });

    return waiver;
  }

  public async removeInvoiceWaivers(invoiceId: InvoiceId) {
    const invoiceItemIds = this.invoiceToInvoiceItemMapper[
      invoiceId.id.toString()
    ];
    invoiceItemIds.map((id) => {
      delete this.invoiceItemToWaiverMapper[id];
    });
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
