import { JournalAdded } from '@hindawi/phenom-events';
import {
  AddCatalogItemToCatalogUseCaseDTO,
  AddCatalogItemToCatalogUseCase,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';

import { EventHandler } from '../event-handler';

const JOURNAL_ADDED = 'JournalAdded';

export const JournalAddedHandler: EventHandler<JournalAdded> = {
  event: JOURNAL_ADDED,
  handler(context: Context) {
    return async (data: JournalAdded) => {
      const {
        repos: { publisher: publisherRepo, catalog: catalogRepo },
        loggerBuilder,
      } = context;

      const logger = loggerBuilder.getLogger(`PhenomEvent:${JOURNAL_ADDED}`);
      logger.info(`Incoming Event Data`, data);

      const addJournalUsecase = new AddCatalogItemToCatalogUseCase(
        catalogRepo,
        publisherRepo
      );

      const request: AddCatalogItemToCatalogUseCaseDTO = {
        isActive: data.isActive,
        journalTitle: data.name,
        created: data.created,
        updated: data.updated,
        journalId: data.id,
        amount: 0,
        currency: 'USD',
        issn: data.issn,
        code: data.code,
        type: null,
      };

      try {
        const result = await addJournalUsecase.execute(request, {
          roles: [Roles.QUEUE_EVENT_HANDLER],
        });

        if (result.isLeft()) {
          logger.error(result.value.message);
          throw result.value;
        }
      } catch (error) {
        logger.error(error.message);
        throw error;
      }
    };
  },
};
