import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../../core/domain/UseCase';
import { AppError } from '../../../../../core/logic/AppError';
import { Either, left, Result, right } from '../../../../../core/logic/Result';
import { UseCaseError } from '../../../../../core/logic/UseCaseError';
import { Publisher } from '../../../../publishers/domain/Publisher';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { CatalogItem } from '../../../domain/CatalogItem';
import { JournalId } from '../../../domain/JournalId';
import { CatalogMap } from '../../../mappers/CatalogMap';
import { CatalogRepoContract } from '../../../repos/catalogRepo';
import { AddCatalogItemToCatalogErrors } from '../addCatalogItemToCatalog/addCatalogItemToCatalogErrors';



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
  PublisherNotFoundError |
  AppError.UnexpectedError,
  Result<CatalogItem>
>;
class PublisherNotFoundError extends Result<UseCaseError> {
  constructor(publisherName: string) {
    super(false, {
      message: `Couldn't find a Publisher for name {${publisherName}}.`
    } as UseCaseError);
  }
}
export class UpdateCatalogItemToCatalogUseCase
  implements
  UseCase<
  UpdateCatalogItemToCatalogUseCaseRequestDTO,
  UpdateCatalogItemToCatalogUseCaseResponse
  > {
  private catalogRepo: CatalogRepoContract;
  private publisherRepo: PublisherRepoContract;

  constructor(catalogRepo: CatalogRepoContract, publisherRepo: PublisherRepoContract) {
    this.catalogRepo = catalogRepo;
    this.publisherRepo = publisherRepo;
  }

  public async execute(
    request: UpdateCatalogItemToCatalogUseCaseRequestDTO
  ): Promise<UpdateCatalogItemToCatalogUseCaseResponse> {
    // const foo = {
    //   amount: 1339,
    //   created: '2020-06-25T04:57:07.247Z',
    //   updated: '2020-06-25T07:04:37.286Z',
    //   currency: 'USD',
    //   issn: '1234-9832',
    //   journalTitle: "bunch of stars - se - it don't work in screening",
    //   isActive: true,
    //   journalId: '16abc826-e86a-44c2-aaa2-d8b4049dfcba',
    // };

    const {
      // type,
      amount,
      created,
      currency,
      isActive,
      issn,
      journalId: rawJournalId,
      journalTitle,
      updated,
    } = request;
    let publisher: Publisher;
    const defaultPublisher = 'Hindawi';
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
    try {
      const journalId: JournalId = JournalId.create(
        new UniqueEntityID(rawJournalId)
      ).getValue();

      // getting catalog item id
      const catalogItem = await this.catalogRepo.getCatalogItemByJournalId(
        journalId
      );

      if (!catalogItem) {
        return left(
          new AppError.UnexpectedError(
            `Journal with id ${journalId.id.toString()} does not exist.`
          )
        );
      }

      const updatedCatalogItem = CatalogMap.toDomain({
        id: journalId.id.toString(),
        // type,
        amount,
        created: created ? new Date(created) : null,
        updated: updated ? new Date(updated) : null,
        currency,
        isActive,
        issn,
        journalId: rawJournalId,
        journalTitle,
        publisherId: publisher.publisherId.id.toString(),
      });

      // * This is where all the magic happens
      await this.catalogRepo.updateCatalogItem(updatedCatalogItem);

      // TODO: will editors change here?
      return right(Result.ok<CatalogItem>(updatedCatalogItem));
    } catch (err) {
      console.log(err);
      return left(new AppError.UnexpectedError(err));
    }
  }
}
