import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { LoggerContract } from '../../../infrastructure/logging/Logger';
import { NoOpUseCase } from '../../../core/domain/NoOpUseCase';
import { UnexpectedError } from '../../../core/logic/AppError';
import { Roles } from '../../../domain/authorization';
import { left } from '../../../core/logic/Either';

import { JournalUpdated as JournalUpdatedEvent } from '../domain/events/JournalUpdated';

import { CatalogRepoContract } from '../../journals/repos/catalogRepo';
import { GetJournalUsecase } from '../../journals/usecases/journals/getJournal';

export class AfterJournalUpdatedEvent
  implements HandleContract<JournalUpdatedEvent> {
  constructor(
    private journalRepo: CatalogRepoContract,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onJournalUpdatedEvent.bind(this),
      JournalUpdatedEvent.name
    );
  }

  private async onJournalUpdatedEvent(
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
    } catch (err) {
      console.error(err);
      console.log(
        `[AfterJournalUpdated]: Failed to execute onJournalUpdatedEvent usecase. Err: ${err}`
      );
    }
    return null;
  }
}
