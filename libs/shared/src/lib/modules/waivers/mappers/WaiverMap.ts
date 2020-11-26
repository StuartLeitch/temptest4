import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';

import { WaiverAssignedProps, WaiverAssigned } from '../domain/WaiverAssigned';
import { WaiverAssignedCollection } from '../domain/WaiverAssignedCollection';
import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
import { Waiver } from '../domain/Waiver';

export class WaiverMap extends Mapper<Waiver> {
  public static toDomain(raw: any): Waiver {
    const waiverOrError = Waiver.create(
      {
        waiverType: raw.type_id,
        reduction: raw.reduction,
        isActive: raw.isActive,
        //metadata: raw.metadata
      },
      new UniqueEntityID(raw.id)
    );

    return waiverOrError.isSuccess ? waiverOrError.getValue() : null;
  }

  public static toDomainCollection(raw: any[]): WaiverAssignedCollection {
    const domainItems = raw
      .map((item) => {
        return {
          invoiceItemId: InvoiceItemId.create(
            new UniqueEntityID(item.invoiceItemId)
          ),
          waiver: WaiverMap.toDomain(item),
          dateAssigned: item.dateAssigned,
        };
      })
      .map((item: WaiverAssignedProps) => WaiverAssigned.create(item));

    return WaiverAssignedCollection.create(domainItems);
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
