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
import { CatalogItem } from '../../domain/CatalogItem';

import { CatalogMap } from '../../mappers/CatalogMap';

import { PublisherRepoContract } from '../../../publishers/repos/publisherRepo';
import { CatalogRepoContract } from '../../repos/catalogRepo';

import { AddCatalogItemToCatalogUseCaseResponse as Response } from './addCatalogToItemCatalogResponse';
import type { AddCatalogItemToCatalogUseCaseDTO as DTO } from './addCatalogItemToCatalogDTO';
import * as Errors from './addCatalogItemToCatalogErrors';

export class AddCatalogItemToCatalogUseCase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Response, Context> {
  constructor(
    private catalogRepo: CatalogRepoContract,
    private publisherRepo: PublisherRepoContract
  ) {
    super();
  }

  @Authorize('journal:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const {
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

      const maybeCatalogItem = CatalogMap.toDomain({
        id: journalId,
        amount,
        created,
        updated,
        currency,
        isActive,
        issn,
        journalId,
        journalTitle,
        publisherId: publisher.publisherId.id.toString(),
      });

      if (maybeCatalogItem.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCatalogItem.value.message))
        );
      }

      catalogItem = maybeCatalogItem.value;

      const maybeIsCreated = await this.catalogRepo.exists(catalogItem);

      if (maybeIsCreated.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeIsCreated.value.message))
        );
      }

      if (maybeIsCreated.value) {
        console.log(`Journal ${catalogItem.journalTitle} already exists.`);
      } else {
        // * This is where all the magic happens
        await this.catalogRepo.save(catalogItem);
      }

      return right(catalogItem);
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
