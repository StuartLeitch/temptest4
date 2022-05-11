// * Core Domain
import { Either, left, right, combine } from '../../../../core/logic/Either';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

// * other
import {
  CatalogRepoContract,
  JournalPriceUpdate,
} from '../../repos/catalogRepo';
import { AuditLoggerServiceContract } from '../../../../infrastructure/audit';
import { RepoError } from '../../../../infrastructure/RepoError';
import { CatalogItem } from '../../domain/CatalogItem';
import { JournalId } from '../../domain/JournalId';

// * Usecase specifics
import { CatalogBulkUpdateResponse as Response } from './catalogBulkUpdateResponse';
import type {
  CatalogBulkUpdateDTO as DTO,
  CatalogBulkUpdateItemDTO as ItemDTO,
} from './catalogBulkUpdateDTO';
import * as Errors from './catalogBulkUpdateErrors';
import {
  JournalAmountBelowZeroError,
  JournalAmountFormatError,
  JournalAmountRequiredError,
  JournalAmountShouldBeZeroForZeroPricedJournalError,
  JournalAmountTooLargeError,
} from './catalogBulkUpdateErrors';

export class CatalogBulkUpdateUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private journalRepo: CatalogRepoContract,
    private auditLoggerService: AuditLoggerServiceContract
  ) {
    super();

    this.journalRepo = journalRepo;
    this.auditLoggerService = auditLoggerService;
  }

  @Authorize('journal:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const maybeValidRequest = validateRequestItems(request);
      if (maybeValidRequest.isLeft()) {
        return left(maybeValidRequest.value);
      }

      const newRequest = transformRequestToEntities(request);

      const maybeOriginalCatalogs = await this.getExistingJournals();
      if (maybeOriginalCatalogs.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeOriginalCatalogs.value.message))
        );
      }

      const catalogsOriginal = maybeOriginalCatalogs.value;

      const changedCatalogItems = filterChangedCatalogItems(
        catalogsOriginal,
        newRequest
      );

      const originalCatalogItems = catalogsOriginal.filter((item) =>
        changedCatalogItems.find((changedItem) =>
          item.journalId.equals(changedItem.journalId)
        )
      );
      const maybeChangesValid = validateChangedCatalogItems(
        changedCatalogItems,
        originalCatalogItems
      );
      if (maybeChangesValid.isLeft()) {
        return left(maybeChangesValid.value);
      }

      const changedCatalogItemsNumber = changedCatalogItems.length;

      if (changedCatalogItemsNumber === 0) {
        return right(changedCatalogItemsNumber);
      }

      const maybeUpdated = await this.journalRepo.bulkUpdate(
        changedCatalogItems
      );

      if (maybeUpdated.isLeft()) {
        return left(new UnexpectedError(maybeUpdated.value));
      }

      this.logChangesInAuditLogs(changedCatalogItems);
      this.sendJournalUpdatedEvents(catalogsOriginal, changedCatalogItems);

      return right(changedCatalogItemsNumber);
    } catch (err) {
      return left(new UnexpectedError(err, 'Bulk Catalog Update failed'));
    }
  }

  private async getExistingJournals(): Promise<
    Either<GuardFailure | RepoError, Array<CatalogItem>>
  > {
    const maybeCatalogsOriginal = await this.journalRepo.getCatalogCollection({
      pagination: { offset: 0 },
    });

    return maybeCatalogsOriginal.map((pagination) => pagination.catalogItems);
  }

  private sendJournalUpdatedEvents(
    originalJournals: Array<CatalogItem>,
    changedCatalogItems: Array<JournalPriceUpdate>
  ): void {
    changedCatalogItems.forEach((changedJournal) => {
      const originalJournal = originalJournals.find((catalogItem) =>
        catalogItem.journalId.equals(changedJournal.journalId)
      );

      if (originalJournal) {
        originalJournal.amount = changedJournal.amount;

        DomainEvents.dispatchEventsForAggregate(originalJournal.id);
      }
    });
  }

  private logChangesInAuditLogs(
    changedCatalogItems: Array<JournalPriceUpdate>
  ): void {
    const logChange = (item: JournalPriceUpdate) => {
      this.auditLoggerService.log({
        action: 'edited',
        entity: 'journal',
        item_reference: item.journalId.toString(),
        target: `Journal #${item.journalId.toString()}`,
        timestamp: new Date(),
      });
    };

    return changedCatalogItems.forEach(logChange);
  }
}

function filterChangedCatalogItems(
  originalJournals: Array<CatalogItem>,
  changedJournals: Array<JournalPriceUpdate>
): Array<JournalPriceUpdate> {
  return changedJournals.filter((changedJournal) =>
    originalJournals.find((catalogItem) => {
      const matchingIds = changedJournal.journalId.equals(
        catalogItem.journalId
      );
      const differentAmounts = changedJournal.amount !== catalogItem.amount;

      return matchingIds && differentAmounts;
    })
  );
}

function transformRequestToEntities(request: DTO): Array<JournalPriceUpdate> {
  return request.catalogItems.map((catalogItem) => ({
    journalId: JournalId.create(new UniqueEntityID(catalogItem.journalId)),
    amount: Number.parseInt(catalogItem.amount, 10),
  }));
}

function validateChangedCatalogItems(
  changedCatalogItems: JournalPriceUpdate[],
  originalCatalogItems: CatalogItem[]
) {
  return combine(
    ...changedCatalogItems.map((item) =>
      validateChangedCatalogItem(
        item,
        originalCatalogItems.filter((origItem) =>
          origItem.journalId.equals(item.journalId)
        )[0]
      )
    )
  );
}

function validateChangedCatalogItem(
  item: JournalPriceUpdate,
  originalCatalogItem: CatalogItem
): Either<
  | JournalAmountBelowZeroError
  | JournalAmountRequiredError
  | JournalAmountTooLargeError
  | JournalAmountFormatError
  | JournalAmountShouldBeZeroForZeroPricedJournalError,
  void
> {
  const regExPattern = new RegExp(/^[0-9]+$/);
  const amount = item.amount;
  const journalId = item.journalId.id.toString();

  if (!regExPattern.test(amount.toString())) {
    return left(new Errors.JournalAmountFormatError(journalId));
  }

  if (amount.toString().length > 6) {
    return left(new Errors.JournalAmountTooLargeError(journalId));
  }

  if (amount <= 0) {
    return left(new Errors.JournalAmountBelowZeroError(journalId));
  }

  if (amount > 0 && originalCatalogItem.isZeroPriced) {
    return left(
      new Errors.JournalAmountShouldBeZeroForZeroPricedJournalError(journalId)
    );
  }

  return right(null);
}

function validateRequestItems(request: DTO) {
  return combine(...request.catalogItems.map(validateRequestItem));
}

function validateRequestItem(
  item: ItemDTO
): Either<
  Errors.JournalIdRequiredError | Errors.JournalAmountFormatError,
  void
> {
  const amount = item.amount;
  const journalId = item.journalId;

  if (!journalId) {
    return left(new Errors.JournalIdRequiredError());
  }

  if (Number.isNaN(amount)) {
    return left(new Errors.JournalAmountFormatError(journalId));
  }

  return right(null);
}
