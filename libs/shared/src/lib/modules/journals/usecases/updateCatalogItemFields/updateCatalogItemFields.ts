import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { right, left, Either } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { JournalId } from '../../domain/JournalId';

import { AuditLoggerServiceContract } from '../../../../infrastructure/audit';
import { PublisherRepoContract } from '../../../publishers/repos';
import { CatalogRepoContract } from '../../repos/catalogRepo';

import { UpdateCatalogItemFieldsResponse as Response } from './updateCatalogItemFieldsResponse';
import type { UpdateCatalogItemFieldsDTO as DTO } from './updateCatalogItemFieldsDTO';
import * as Errors from './updateCatalogItemFieldsErrors';

export class UpdateCatalogItemFieldsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Response, Context>
{
  constructor(
    private readonly catalogRepo: CatalogRepoContract,
    private readonly publisherRepo: PublisherRepoContract,
    private readonly auditLoggerService: AuditLoggerServiceContract
  ) {
    super();
  }

  @Authorize('journal:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const {
      journalId: rawJournalId,
      publisherName,
      zeroPriced,
      amount,
    } = request;
    try {
      const journalId: JournalId = JournalId.create(
        new UniqueEntityID(rawJournalId)
      );

      // validate amount from request
      const maybeRequestAmountValid = validateRequestAmount(amount, zeroPriced);
      if (maybeRequestAmountValid.isLeft()) {
        return left(maybeRequestAmountValid.value);
      }

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

      const maybePublisherId = await this.publisherRepo.getPublisherByName(
        publisherName
      );
      if (maybePublisherId.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePublisherId.value.message))
        );
      }

      const publisherId = maybePublisherId.value;

      catalogItem.publisherId = publisherId;

      // * PPBK_2715: if there's a price change, log it
      if (
        Number(catalogItem.amount) !== Number(amount) ||
        catalogItem.isZeroPriced !== zeroPriced
      ) {
        // * Save information as audit log

        this.auditLoggerService.log({
          action: 'edited',
          entity: 'journal',
          item_reference: catalogItem.journalId.toString(),
          target: `Journal #${catalogItem.journalId.toString()}`,
          timestamp: new Date(),
        });
      }

      // trigger the JOURNAL_APC_UPDATED event given it has a different value than one registered already

      catalogItem.amount = amount;
      catalogItem.isZeroPriced = zeroPriced;

      const maybeUpdatedCatalog = await this.catalogRepo.updateCatalogItem(
        catalogItem
      );

      if (maybeUpdatedCatalog.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeUpdatedCatalog.value.message))
        );
      }

      DomainEvents.dispatchEventsForAggregate(catalogItem.id);

      return right(maybeUpdatedCatalog.value);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}

function validateRequestAmount(
  amount: number,
  zeroPriced: boolean
): Either<
  | Errors.AmountIsZeroError
  | Errors.AmountIllegalFormatError
  | Errors.AmountNotFoundError,
  void
> {
  if (zeroPriced) {
    return right(null);
  }
  if (amount === 0) {
    return left(new Errors.AmountIsZeroError());
  }

  if (!amount) {
    return left(new Errors.AmountNotFoundError());
  }

  if (Number.isNaN(amount)) {
    return left(new Errors.AmountIllegalFormatError());
  }

  return right(null);
}
