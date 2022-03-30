import { JournalUpdated } from '@hindawi/phenom-events';
import { Roles, UpdateCatalogItemToCatalogUseCase } from '@hindawi/shared';

import { Context } from '../../builders';

import { EventHandler } from '../event-handler';

const JOURNAL_UPDATED = 'JournalUpdated';

export const JournalUpdatedHandler: EventHandler<JournalUpdated> = {
  event: JOURNAL_UPDATED,
  handler(context: Context) {
    return async (data: JournalUpdated) => {
      const usecaseContext = { roles: [Roles.QUEUE_EVENT_HANDLER] };

      const {
        repos: { catalog: catalogRepo, publisher: publisherRepo },
        services: { logger },
      } = context;

      logger.setScope(`PhenomEvent:${JOURNAL_UPDATED}`);
      logger.info(`Incoming Event Data`, data);

      const updateJournalUsecase = new UpdateCatalogItemToCatalogUseCase(
        catalogRepo,
        publisherRepo
      );

      const result = await updateJournalUsecase.execute(
        {
          isActive: data.isActive,
          journalTitle: data.name,
          created: data.created,
          updated: data.updated,
          journalId: data.id,
          currency: 'USD',
          issn: data.issn,
          code: data.code,
          type: null,
        },
        usecaseContext
      );

      if (result.isLeft()) {
        logger.error(result.value.message);
        throw result.value;
      }
    };
  },
};
