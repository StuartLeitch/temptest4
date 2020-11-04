/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { JournalAdded } from '@hindawi/phenom-events';

import { AddCatalogItemToCatalogUseCaseRequestDTO } from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalogDTOs';
import { AddCatalogItemToCatalogUseCase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalog';

import { Context } from '../../builders';

import { EventHandler } from '../event-handler';

const JOURNAL_ADDED = 'JournalAdded';

export const JournalAddedHandler: EventHandler<JournalAdded> = {
  event: JOURNAL_ADDED,
  handler(context: Context) {
    return async (data: JournalAdded) => {
      const {
        repos: { publisher: publisherRepo, catalog: catalogRepo },
        services: { logger },
      } = context;

      logger.setScope(`PhenomEvent:${JOURNAL_ADDED}`);
      logger.info(`Incoming Event Data`, data);

      const addJournalUsecase = new AddCatalogItemToCatalogUseCase(
        catalogRepo,
        publisherRepo
      );

      const request: AddCatalogItemToCatalogUseCaseRequestDTO = {
        isActive: data.isActive,
        journalTitle: data.name,
        created: data.created,
        updated: data.updated,
        journalId: data.id,
        amount: data.apc,
        currency: 'USD',
        issn: data.issn,
        type: null,
      };

      try {
        const result = await addJournalUsecase.execute(request);

        if (result.isLeft()) {
          logger.error(result.value.errorValue().message);
          throw result.value.error;
        }
      } catch (error) {
        logger.error(error.message);
        throw error;
      }
    };
  },
};
