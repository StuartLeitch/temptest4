// import {Money, Currencies} from 'ts-money';

import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { CatalogItem } from '../domain/CatalogItem';
import { JournalId } from '../domain/JournalId';
import { PublisherId } from '../../publishers/domain/PublisherId';
// import {TransactionStatus} from '../domain/Transaction';

export class CatalogMap extends Mapper<CatalogItem> {
  public static toDomain(raw: any): CatalogItem {
    const catalogOrError = CatalogItem.create(
      {
        type: raw.type,
        amount: raw.amount,
        journalId: JournalId.create(
          new UniqueEntityID(raw.journalId)
        ).getValue(),
        created: raw.created ? new Date(raw.created) : null,
        updated: raw.updated ? new Date(raw.updated) : null,
        currency: raw.currency,
        isActive: !!raw.isActive,
        journalTitle: raw.journalTitle,
        publisherId: raw.publisherId
          ? PublisherId.create(new UniqueEntityID(raw.publisherId)).getValue()
          : null,
        issn: raw.issn,
        // price: Money.fromInteger({amount: raw.amount, currency: Currencies.USD})
        // dateUpdated: new Date(raw.dateUpdated)
      },
      new UniqueEntityID(raw.id)
    );

    return catalogOrError.isSuccess ? catalogOrError.getValue() : null;
  }

  public static toPersistence(catalogItem: CatalogItem): any {
    return {
      id: catalogItem.id.toString(),
      type: catalogItem.type,
      amount: catalogItem.amount,
      journalId: catalogItem.journalId.id.toString(),
      created: catalogItem.created,
      updated: catalogItem.updated,
      isActive: catalogItem.isActive ? 1 : 0,
      currency: catalogItem.currency,
      journalTitle: catalogItem.journalTitle,
      publisherId: catalogItem.publisherId.id.toString(),
      issn: catalogItem.issn,
      // status: catalog.status,
      // amount: catalog.amount.value,
      // dateAdded: catalog.dateAdded,
      // dateUpdated: catalog.dateUpdated
    };
  }
}
