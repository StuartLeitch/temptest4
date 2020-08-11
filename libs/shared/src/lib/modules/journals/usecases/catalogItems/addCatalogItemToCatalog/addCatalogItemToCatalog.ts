import { UseCase } from '../../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../../core/logic/Result';

import { CatalogItem } from '../../../domain/CatalogItem';
import { CatalogRepoContract } from '../../../repos/catalogRepo';
import { Publisher } from './../../../../publishers/domain/Publisher';
import { PublisherRepoContract } from './../../../../publishers/repos/publisherRepo';
// import { JournalId } from '../../../domain/JournalId';
// import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';
import { AppError } from '../../../../../../lib/core/logic/AppError';
import { CatalogMap } from '../../../mappers/CatalogMap';

import { AddCatalogItemToCatalogUseCaseRequestDTO } from './addCatalogItemToCatalogDTOs';
import { AddCatalogItemToCatalogErrors } from './addCatalogItemToCatalogErrors';
import { AddCatalogItemToCatalogUseCaseResponse } from './addCatalogToItemCatalogResponse';

export class AddCatalogItemToCatalogUseCase
  implements
    UseCase<
      AddCatalogItemToCatalogUseCaseRequestDTO,
      AddCatalogItemToCatalogUseCaseResponse
    > {
  constructor(
    private catalogRepo: CatalogRepoContract,
    private publisherRepo: PublisherRepoContract
  ) {}

  public async execute(
    request: AddCatalogItemToCatalogUseCaseRequestDTO
  ): Promise<AddCatalogItemToCatalogUseCaseResponse> {
    const {
      // type,
      amount,
      created,
      currency,
      isActive,
      issn,
      journalId,
      journalTitle,
      updated,
    } = request;

    let catalogItem: CatalogItem;
    let publisher: Publisher;
    const defaultPublisher = 'Hindawi';

    try {
      try {
        publisher = await this.publisherRepo.getPublisherByName(
          defaultPublisher
        );
      } catch (err) {
        return left(
          new AddCatalogItemToCatalogErrors.PublisherNotFoundError(
            defaultPublisher
          )
        );
      }

      catalogItem = CatalogMap.toDomain({
        id: journalId,
        // type,
        apc: amount,
        created,
        updated,
        currency,
        isActive,
        issn,
        journalId,
        name: journalTitle,
        publisherId: publisher.publisherId.id.toString(),
      });

      // * This is where all the magic happens
      await this.catalogRepo.save(catalogItem);

      return right(Result.ok<CatalogItem>(catalogItem));
    } catch (err) {
      console.log(err);
      return left(new AppError.UnexpectedError(err));
    }
  }
}
