import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { InvoiceItem, InvoiceItemType } from '../domain/InvoiceItem';
import { InvoiceId } from '../domain/InvoiceId';
import { ManuscriptId } from 'libs/shared/src/lib/modules/invoices/domain/ManuscriptId';

export interface InvoiceItemPersistenceDTO {
  id?: string;
  invoiceId: string;
  manuscriptId: string;
  type?: InvoiceItemType;
  name?: string;
  price?: number;
  vat?: number;
  dateCreated?: Date;
}

export class InvoiceItemMap extends Mapper<InvoiceItem> {
  public static toDomain(raw: InvoiceItemPersistenceDTO): InvoiceItem {
    const invoiceItemOrError = InvoiceItem.create(
      {
        invoiceId: InvoiceId.create(
          new UniqueEntityID(raw.invoiceId)
        ).getValue(),
        manuscriptId: ManuscriptId.create(
          new UniqueEntityID(raw.manuscriptId)
        ).getValue(),
        type: raw.type,
        price: raw.price,
        vat: raw.vat,
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
      manuscriptId: invoiceItem.manuscriptId.id.toString(),
      type: invoiceItem.type,
      price: invoiceItem.price,
      vat: invoiceItem.vat,
      dateCreated: invoiceItem.dateCreated
    };
  }
}
