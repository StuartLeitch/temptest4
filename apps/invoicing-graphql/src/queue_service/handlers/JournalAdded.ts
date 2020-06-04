/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { JournalAdded } from '@hindawi/phenom-events';

import { AddCatalogItemToCatalogUseCase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalog';
import { AddCatalogItemToCatalogUseCaseRequestDTO } from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalogDTOs';

const JOURNAL_ADDED = 'JournalAdded';

export const JournalAddedHandler = {
  event: JOURNAL_ADDED,
  async handler(data: JournalAdded) {
    const {
      repos: { catalog: catalogRepo, publisher: publisherRepo },
      services: { logger },
    } = this;

    logger.setScope(`PhenomEvent:${JOURNAL_ADDED}`);
    logger.info(`Incoming Event Data`, data);

    const addJournalUsecase = new AddCatalogItemToCatalogUseCase(
      catalogRepo,
      publisherRepo
    );
    try {
      const result = await addJournalUsecase.execute({
        // type: data.id,
        amount: data.apc,
        created: data.created,
        updated: data.updated,
        currency: 'USD',
        issn: data.issn,
        journalTitle: data.name,
        isActive: data.isActive,
        journalId: data.id,
      } as AddCatalogItemToCatalogUseCaseRequestDTO);

      if (result.isLeft()) {
        logger.error(result.value.errorValue().message);
        throw result.value.error;
      }
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  },
};
