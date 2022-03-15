import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { LoggerContract } from '../../../infrastructure/logging/Logger';
import { NoOpUseCase } from '../../../core/domain/NoOpUseCase';
import { UnexpectedError } from '../../../core/logic/AppError';
import { Roles } from '../../../domain/authorization';
import { left } from '../../../core/logic/Either';

import { JournalUpdated as JournalUpdatedEvent } from '../domain/events/JournalUpdated';

import { CatalogRepoContract } from '../repos/catalogRepo';
import { GetJournalUsecase } from '../usecases/journals/getJournal';
import { PublishJournalAPCUpdatedUsecase } from '../usecases/publishEvents/publishJournalAPCUpdated';

export class AfterJournalAPCUpdated
  implements HandleContract<JournalUpdatedEvent>
{
  constructor(
    private journalRepo: CatalogRepoContract,
    private publishJournalAPCUpdated:
      | PublishJournalAPCUpdatedUsecase
      | NoOpUseCase,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onJournalAPCUpdated.bind(this),
      JournalUpdatedEvent.name
    );
  }

  private async onJournalAPCUpdated(
    event: JournalUpdatedEvent
  ): Promise<unknown> {
    const defaultContext = {
      roles: [Roles.DOMAIN_EVENT_HANDLER],
    };

    const getJournalDetails = new GetJournalUsecase(this.journalRepo);

    try {
      const maybeJournal = await getJournalDetails.execute(
        { journalId: event.catalogItem.journalId.id.toString() },
        defaultContext
      );

      if (maybeJournal.isLeft()) {
        return left(new UnexpectedError(new Error(maybeJournal.value.message)));
      }

      const journal = maybeJournal.value;
      const publishResult = await this.publishJournalAPCUpdated.execute(
        { journal },
        defaultContext
      );

      if (publishResult.isLeft()) {
        return left(publishResult.value.message);
      }

      this.loggerService.info(
        `[AfterJournalAPCUpdated]: Successfully executed onJournalAPCUpdated event usecase`
      );
    } catch (err) {
      this.loggerService.error(
        `[AfterJournalAPCUpdated]: Failed to execute onJournalUpdatedEvent usecase. Err: ${err}`
      );
    }
    return null;
  }
}
