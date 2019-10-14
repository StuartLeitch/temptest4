import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {InvoiceItem, InvoiceItemType} from '../domain/InvoiceItem';
import {InvoiceId} from '../domain/InvoiceId';

export interface InvoiceItemPersistenceDTO {
  id: string;
  invoiceId: string;
  type: InvoiceItemType;
  name: string;
  price: number;
  dateCreated: Date;
}

export class InvoiceItemMap extends Mapper<InvoiceItem> {
  public static toDomain(raw: InvoiceItemPersistenceDTO): InvoiceItem {
    const invoiceItemOrError = InvoiceItem.create(
      {
        invoiceId: InvoiceId.create(new UniqueEntityID(raw.invoiceId)),
        type: raw.type,
        name: raw.name,
        price: raw.price,
        dateCreated: new Date(raw.dateCreated)
      },
      new UniqueEntityID(raw.id)
    );

    if (invoiceItemOrError.isFailure) {
      return null;
    }

    return invoiceItemOrError.getValue();
  }

  public static toPersistence(
    invoiceItem: InvoiceItem
  ): InvoiceItemPersistenceDTO {
    return {
      id: invoiceItem.id.toString(),
      invoiceId: invoiceItem.invoiceId.id.toString(),
      type: invoiceItem.type,
      name: invoiceItem.name,
      price: invoiceItem.price,
      dateCreated: invoiceItem.dateCreated
    };
  }
}
