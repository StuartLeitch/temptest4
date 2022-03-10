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

import { JournalId } from '../../domain/JournalId';

import { CatalogMap } from '../../mappers/CatalogMap';

import { CatalogRepoContract } from '../../repos/catalogRepo';
import { PublisherRepoContract } from '../../../publishers/repos';
import { AuditLoggerServiceContract } from '../../../../infrastructure/audit';

import { UpdateCatalogItemFieldsResponse as Response } from './updateCatalogItemFieldsResponse';
import type { UpdateCatalogItemFieldsDTO as DTO } from './updateCatalogItemFieldsDTO';
import * as Errors from './updateCatalogItemFieldsErrors';

export class UpdateCatalogItemFieldsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Response, Context> {
  private catalogRepo: CatalogRepoContract;
  private publisherRepo: PublisherRepoContract;
  private auditLoggerService: AuditLoggerServiceContract;

  constructor(
    catalogRepo: CatalogRepoContract,
    publisherRepo: PublisherRepoContract,
    auditLoggerService: AuditLoggerServiceContract
  ) {
    super();

    this.catalogRepo = catalogRepo;
    this.publisherRepo = publisherRepo;
    this.auditLoggerService = auditLoggerService;
  }

  @Authorize('journal:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { amount, journalId: rawJournalId, publisherName } = request;

    try {
      const journalId: JournalId = JournalId.create(
        new UniqueEntityID(rawJournalId)
      );

      // getting catalog item by id
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
        return left(new Errors.CatalogNotFound(journalId.id.toString()));
      }

      //getting publisherId by publisher name
      const maybePublisherId = await this.publisherRepo.getPublisherByName(
        publisherName
      );
      if (maybePublisherId.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePublisherId.value.message))
        );
      }

      const publisherId = maybePublisherId.value;
      const maybeUpdatedCatalogItem = CatalogMap.toDomain({
        id: catalogItem.id,
        amount,
        created: catalogItem.created,
        updated: new Date(),
        isActive: catalogItem.isActive,
        journalId: rawJournalId,
        publisherId: publisherId.id.toString(),
      });

      if (maybeUpdatedCatalogItem.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeUpdatedCatalogItem.value.message))
        );
      }

      const updatedCatalogItem = maybeUpdatedCatalogItem.value;

      // * Call knex update method from service for DB changes
      const maybeResult = await this.catalogRepo.updateCatalogItem(
        updatedCatalogItem
      );

      if (maybeResult.isLeft()) {
        return left(new UnexpectedError(new Error(maybeResult.value.message)));
      }

      // * PPBK_2715: if there's a price change, log it
      if (Number(catalogItem.amount) !== Number(updatedCatalogItem.amount)) {
        // * Save information as audit log
        this.auditLoggerService.log({
          action: 'edited',
          entity: 'journal',
          item_reference: updatedCatalogItem.journalId.toString(),
          target: `Journal #${updatedCatalogItem.journalId.toString()}`,
          timestamp: new Date(),
        });
      }

      return right(updatedCatalogItem);
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err));
    }
  }
}
