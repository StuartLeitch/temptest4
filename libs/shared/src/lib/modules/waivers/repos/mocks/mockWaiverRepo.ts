import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Either, right, left } from '../../../../core/logic/Either';

import { RepoError } from '../../../../infrastructure/RepoError';

import { WaiverAssignedCollection } from '../../domain/WaiverAssignedCollection';
import { InvoiceItemId } from '../../../invoices/domain/InvoiceItemId';
import { WaiverAssigned } from '../../domain/WaiverAssigned';
import { Waiver, WaiverType } from '../../domain/Waiver';

import { WaiverRepoContract } from '../waiverRepo';

export class MockWaiverRepo
  extends BaseMockRepo<Waiver>
  implements WaiverRepoContract {
  private invoiceItemToWaiverMapper: {
    [key: string]: UniqueEntityID[];
  } = {};
  private invoiceItemToWaiverAssignedDate: {
    [key: string]: {
      [key: string]: Date;
    };
  } = {};

  constructor() {
    super();
  }

  public async getWaiversByTypes(
    waiverTypes: WaiverType[]
  ): Promise<Either<GuardFailure | RepoError, Waiver[]>> {
    const resultWaivers: Waiver[] = [];

    for (let index = 0; index < waiverTypes.length; index++) {
      const waiver = await this.getWaiverByType(waiverTypes[index]);
      if (waiver.isLeft()) {
        return left(waiver.value);
      }
      resultWaivers.push(waiver.value);
    }
    return right(resultWaivers);
  }

  public async getWaivers(): Promise<
    Either<GuardFailure | RepoError, Waiver[]>
  > {
    return right(this._items);
  }

  public async getWaiverByType(
    type: WaiverType
  ): Promise<Either<GuardFailure | RepoError, Waiver>> {
    const match = this._items.find((item) => item.waiverType === type);
    if (match) {
      return right(match);
    } else {
      return left(RepoError.createEntityNotFoundError('waiver', type));
    }
  }

  public addMockWaiverForInvoiceItem(
    newWaiver: Waiver,
    invoiceItemId: InvoiceItemId,
    dateAssigned: Date = new Date()
  ): void {
    const invoiceIdValue = invoiceItemId.id.toString();
    if (!this.invoiceItemToWaiverMapper[invoiceIdValue]) {
      this.invoiceItemToWaiverMapper[invoiceIdValue] = [];
      this.invoiceItemToWaiverAssignedDate[invoiceIdValue] = {};
    }

    this.invoiceItemToWaiverMapper[invoiceIdValue].push(newWaiver.id);
    this.invoiceItemToWaiverAssignedDate[invoiceIdValue][
      newWaiver.id.toString()
    ] = dateAssigned;
    this.addMockItem(newWaiver);
  }

  public async getWaiversByInvoiceItemId(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, WaiverAssignedCollection>> {
    const waiverIds = this.invoiceItemToWaiverMapper[
      invoiceItemId.id.toString()
    ];
    if (!waiverIds) {
      return right(WaiverAssignedCollection.create());
    }
    const waivers = this._items.filter((item) => waiverIds.includes(item.id));

    return right(
      WaiverAssignedCollection.create(
        waivers.map((i) => {
          let dateAssigned: Date = null;
          const datesForItemWaiver = this.invoiceItemToWaiverAssignedDate[
            invoiceItemId.id.toString()
          ];
          if (datesForItemWaiver) {
            dateAssigned = datesForItemWaiver[i.id.toString()];
          }
          return WaiverAssigned.create({
            invoiceItemId,
            dateAssigned,
            waiver: i,
          });
        })
      )
    );
  }

  public async attachWaiverToInvoiceItem(
    waiverType: WaiverType,
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, Waiver>> {
    if (!invoiceItemId) {
      return;
    }
    const waiver = await this.getWaiverByType(waiverType);

    if (waiver.isLeft()) {
      return left(waiver.value);
    }

    const invoiceIdValue = invoiceItemId.id.toString();
    if (!this.invoiceItemToWaiverMapper[invoiceIdValue]) {
      this.invoiceItemToWaiverMapper[invoiceIdValue] = [];
    }

    this.invoiceItemToWaiverMapper[invoiceIdValue].push(waiver.value.id);

    return waiver;
  }

  public async removeInvoiceItemWaivers(
    invoiceItemId: InvoiceItemId
  ): Promise<Either<GuardFailure | RepoError, void>> {
    delete this.invoiceItemToWaiverMapper[invoiceItemId.id.toValue()];

    return right(null);
  }

  public async save(
    waiver: Waiver
  ): Promise<Either<GuardFailure | RepoError, Waiver>> {
    const maybeAlreadyExists = await this.exists(waiver);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

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

    return right(waiver);
  }

  public async exists(
    waiver: Waiver
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) => this.compareMockItems(i, waiver));
    return right(found.length !== 0);
  }

  public compareMockItems(a: Waiver, b: Waiver): boolean {
    return a.id.equals(b.id);
  }
}
