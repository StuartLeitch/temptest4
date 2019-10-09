// import {Money, Currencies} from 'ts-money';

import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {CatalogItem} from '../domain/CatalogItem';
// import {CatalogId} from '../domain/CatalogId';
// import {STATUS as TransactionStatus} from '../domain/Transaction';

export class CatalogPersistenceDTO {
  id: string;
  type: string;
  // articleId: string;
  // status: TransactionStatus;
  price: number;
  // dateAdded?: Date;
  // dateUpdated?: Date;
}

export class CatalogMap extends Mapper<CatalogItem> {
  public static toDomain(raw: CatalogPersistenceDTO): CatalogItem {
    const catalogOrError = CatalogItem.create(
      {
        // articleId: ArticleId.create(new UniqueEntityID(raw.articleId)),
        // price: Money.fromInteger({amount: raw.amount, currency: Currencies.USD})
        type: raw.type,
        price: raw.price
        // dateUpdated: new Date(raw.dateUpdated)
      },
      new UniqueEntityID(raw.id)
    );

    return catalogOrError.isSuccess ? catalogOrError.getValue() : null;
  }

  public static toPersistence(catalogItem: CatalogItem): CatalogPersistenceDTO {
    return {
      id: catalogItem.id.toString(),
      type: catalogItem.type,
      price: catalogItem.price
      // articleId: catalog.articleId.toString(),
      // status: catalog.status,
      // amount: catalog.amount.value,
      // dateAdded: catalog.dateAdded,
      // dateUpdated: catalog.dateUpdated
    };
  }
}
