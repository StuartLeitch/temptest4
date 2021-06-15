import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, flatten, right } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { WaiverAssignedProps, WaiverAssigned } from '../domain/WaiverAssigned';
import { WaiverAssignedCollection } from '../domain/WaiverAssignedCollection';
import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
import { Waiver } from '../domain/Waiver';

export class WaiverMap extends Mapper<Waiver> {
  public static toDomain(raw: any): Either<GuardFailure, Waiver> {
    const maybeWaiver = Waiver.create(
      {
        waiverType: raw.type_id,
        reduction: raw.reduction,
        isActive: raw.isActive,
      },
      new UniqueEntityID(raw.id)
    );

    return maybeWaiver;
  }

  public static toDomainCollection(
    raw: any[]
  ): Either<GuardFailure, WaiverAssignedCollection> {
    const maybeWaivers = flatten(
      raw.map((item) =>
        WaiverMap.toDomain(item).map((waiver) => ({ waiver, item }))
      )
    );

    const maybeItemsList = maybeWaivers.map((list) =>
      list
        .map(({ waiver, item }) => ({
          invoiceItemId: InvoiceItemId.create(
            new UniqueEntityID(item.invoiceItemId)
          ),
          dateAssigned: item.dateAssigned,
          waiver,
        }))
        .map((item: WaiverAssignedProps) => WaiverAssigned.create(item))
    );

    return maybeItemsList.map(WaiverAssignedCollection.create);
  }

  public static toPersistence(waiver: Waiver): any {
    return {
      type_id: waiver.waiverType,
      reduction: waiver.reduction,
      isActive: waiver.isActive,
    };
  }

  public static toEvent(waiver: Waiver): any {
    return {
      type_id: waiver.waiverType,
      reduction: waiver.reduction,
    };
  }
}
