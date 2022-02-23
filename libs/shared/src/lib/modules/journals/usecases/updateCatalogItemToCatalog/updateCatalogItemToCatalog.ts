import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { Publisher } from '../../../publishers/domain/Publisher';
import { JournalId } from '../../domain/JournalId';

import { CatalogMap } from '../../mappers/CatalogMap';

import { PublisherRepoContract } from '../../../publishers/repos';
import { CatalogRepoContract } from '../../repos/catalogRepo';

import { UpdateCatalogItemToCatalogResponse as Response } from './updateCatalogItemToCatalogResponse';
import type { UpdateCatalogItemToCatalogDTO as DTO } from './updateCatalogItemToCatalogDTO';
import * as Errors from './updateCatalogItemToCatalogErrors';

export class UpdateCatalogItemToCatalogUseCase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Response, Context> {
  private catalogRepo: CatalogRepoContract;
  private publisherRepo: PublisherRepoContract;

  constructor(
    catalogRepo: CatalogRepoContract,
    publisherRepo: PublisherRepoContract
  ) {
    super();

    this.catalogRepo = catalogRepo;
    this.publisherRepo = publisherRepo;
  }

  @Authorize('journal:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const {
      amount,
      created,
      currency,
      isActive,
      issn,
      code,
      journalId: rawJournalId,
      journalTitle,
      updated,
    } = request;
    let publisher: Publisher;
    const defaultPublisher = 'Hindawi';
    try {
      const maybePublisher = await this.publisherRepo.getPublisherByName(
        defaultPublisher
      );

      if (maybePublisher.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePublisher.value.message))
        );
      }

      publisher = maybePublisher.value;
    } catch (err) {
      return left(new Errors.PublisherNotFoundError(defaultPublisher));
    }
    try {
      const journalId: JournalId = JournalId.create(
        new UniqueEntityID(rawJournalId)
      );

      // getting catalog item id
      const maybeCatalogItem = await this.catalogRepo.getCatalogItemByJournalId(
        journalId
      );

      if (maybeCatalogItem.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCatalogItem.value.message))
        );
      }

      const catalogItem = maybeCatalogItem.value;

      if (!catalogItem) {
        return left(
          new UnexpectedError(
            new Error(
              `Journal with id ${journalId.id.toString()} does not exist.`
            ),
            `Journal with id ${journalId.id.toString()} does not exist.`
          )
        );
      }

      const maybeUpdatedCatalogItem = CatalogMap.toDomain({
        id: catalogItem.id,
        amount,
        created: created ? new Date(created) : null,
        updated: updated ? new Date(updated) : null,
        currency,
        isActive,
        issn,
        code,
        journalId: rawJournalId,
        journalTitle,
        publisherId: catalogItem.publisherId
          ? catalogItem.publisherId.id.toString()
          : publisher.publisherId.id.toString(),
      });

      if (maybeUpdatedCatalogItem.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeUpdatedCatalogItem.value.message))
        );
      }

      const updatedCatalogItem = maybeUpdatedCatalogItem.value;

      // * This is where all the magic happens
      const maybeResult = await this.catalogRepo.updateCatalogItem(
        updatedCatalogItem
      );

      if (maybeResult.isLeft()) {
        return left(new UnexpectedError(new Error(maybeResult.value.message)));
      }

      // TODO: will editors change here?
      return right(updatedCatalogItem);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
