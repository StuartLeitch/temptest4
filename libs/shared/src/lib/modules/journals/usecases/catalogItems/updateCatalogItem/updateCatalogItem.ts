import { UseCase } from '../../../../../core/domain/UseCase';
import { Result, Either, left, right } from '../../../../../core/logic/Result';

import { CatalogItem } from '../../../domain/CatalogItem';
import { CatalogRepoContract } from '../../../repos/catalogRepo';
import { JournalId } from '../../../domain/JournalId';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';
import { UnexpectedError } from 'libs/shared/src/lib/core/logic/AppError';
import { CatalogMap } from '../../../mappers/CatalogMap';

export interface UpdateCatalogItemToCatalogUseCaseRequestDTO {
  type: string;
  amount: number;
  currency?: string;
  journalId: string;
  journalTitle?: string;
  issn?: string;
  created?: string;
  updated?: string;
  isActive?: boolean;
}
export type UpdateCatalogItemToCatalogUseCaseResponse = Either<
  // | UpdateTransactionErrors.SomeBlahBlahError
  UnexpectedError,
  Result<CatalogItem>
>;
export class UpdateCatalogItemToCatalogUseCase
  implements
    UseCase<
      UpdateCatalogItemToCatalogUseCaseRequestDTO,
      UpdateCatalogItemToCatalogUseCaseResponse
    > {
  private catalogRepo: CatalogRepoContract;

  constructor(catalogRepo: CatalogRepoContract) {
    this.catalogRepo = catalogRepo;
  }

  public async execute(
    request: UpdateCatalogItemToCatalogUseCaseRequestDTO
  ): Promise<UpdateCatalogItemToCatalogUseCaseResponse> {
    const {
      type,
      amount,
      created,
      currency,
      isActive,
      issn,
      journalId,
      journalTitle,
      updated,
    } = request;

    try {
      const journalIdValueObject = JournalId.create(
        new UniqueEntityID(journalId)
      ).getValue();

      // getting catalog item id
      let catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
        journalIdValueObject
      );

      if (!catalogItem) {
        return left(
          new UnexpectedError(
            `Journal with id ${journalIdValueObject.id.toString()} does not exist.`
          )
        );
      }

      const catalogItemOrError = CatalogItem.create(
        {
          type,
          amount,
          created: created ? new Date(created) : null,
          updated: updated ? new Date(updated) : null,
          currency,
          isActive,
          issn,
          journalId: journalIdValueObject,
          journalTitle,
          publisherId: catalogItem.publisherId,
        },
        catalogItem.id
      );

      if (catalogItemOrError.isFailure) {
        return left(new UnexpectedError(catalogItemOrError.error));
      }

      catalogItem = catalogItemOrError.getValue();

      // This is where all the magic happens
      await this.catalogRepo.updateCatalogItem(catalogItem);

      // todo will editors change here?
      return right(Result.ok<CatalogItem>(catalogItem));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
