import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { PublisherId } from '../../publishers/domain/PublisherId';
import { Mapper } from '../../../infrastructure/Mapper';
import { CatalogItem } from '../domain/CatalogItem';
import { JournalId } from '../domain/JournalId';

export class CatalogMap extends Mapper<CatalogItem> {
  public static toDomain(raw: any): Either<GuardFailure, CatalogItem> {
    return CatalogItem.create(
      {
        type: raw.type,
        amount: raw.amount,
        journalId: JournalId.create(new UniqueEntityID(raw.journalId)),
        created: raw.created ? new Date(raw.created) : null,
        updated: raw.updated ? new Date(raw.updated) : null,
        currency: raw.currency,
        isActive: !!raw.isActive,
        journalTitle: raw.journalTitle,
        publisherId: raw.publisherId
          ? PublisherId.create(new UniqueEntityID(raw.publisherId))
          : null,
        issn: raw.issn,
        code: raw.code,
      },
      new UniqueEntityID(raw.id)
    );
  }

  public static toPersistence(catalogItem: CatalogItem): any {
    return {
      id: catalogItem.id.toString(),
      type: catalogItem.type || 'APC',
      amount: catalogItem.amount,
      journalId: catalogItem.journalId.id.toString(),
      created: catalogItem.created,
      updated: catalogItem.updated,
      isActive: catalogItem.isActive ? 1 : 0,
      currency: catalogItem.currency,
      journalTitle: catalogItem.journalTitle,
      publisherId: catalogItem.publisherId.id.toString(),
      issn: catalogItem.issn,
      code: catalogItem.code,
    };
  }
}
