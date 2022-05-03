import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { CatalogPaginated } from '../../domain/CatalogPaginated';
import { CatalogItem } from '../../domain/CatalogItem';
import { JournalId } from '../../domain/JournalId';

import { CatalogRepoContract, JournalPriceUpdate } from '../catalogRepo';

export class MockCatalogRepo
  extends BaseMockRepo<CatalogItem>
  implements CatalogRepoContract
{
  constructor() {
    super();
  }

  public async getCatalogItemByJournalId(
    journalId: JournalId
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const match = this._items.find((i) => i.journalId.equals(journalId));
    return right(match);
  }

  public async getCatalogItemById(
    catalogId: UniqueEntityID
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const match = this._items.find((i) => i.id.equals(catalogId));
    return right(match);
  }

  public async getCatalogCollection(): Promise<
    Either<GuardFailure | RepoError, CatalogPaginated>
  > {
    return right({
      catalogItems: this._items,
      totalCount: this._items.length,
    });
  }

  public async bulkUpdate(
    catalogItems: Array<JournalPriceUpdate>
  ): Promise<Either<GuardFailure | RepoError, void>> {
    return right(null);
  }

  public async updateCatalogItem(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const maybeExists = await this.exists(catalogItem);

    if (maybeExists.isLeft()) {
      return left(maybeExists.value);
    }

    if (maybeExists.value) {
      return this.save(catalogItem);
    } else {
      return left(
        RepoError.createEntityNotFoundError(
          'catalogItem',
          catalogItem.id.toString()
        )
      );
    }
  }

  public async exists(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, catalogItem)
    );
    return right(found.length !== 0);
  }

  public async save(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const maybeAlreadyExists = await this.exists(catalogItem);

    if (maybeAlreadyExists.isLeft()) {
      return left(maybeAlreadyExists.value);
    }

    if (maybeAlreadyExists.value) {
      this._items.map((i, idx) => {
        if (this.compareMockItems(i, catalogItem)) {
          this._items[idx] = catalogItem;
          return catalogItem;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(catalogItem);
    }

    return right(catalogItem);
  }

  public compareMockItems(a: CatalogItem, b: CatalogItem): boolean {
    return a.id.equals(b.id);
  }
}
