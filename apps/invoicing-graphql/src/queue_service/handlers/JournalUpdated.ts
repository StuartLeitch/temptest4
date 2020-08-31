/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { JournalUpdated } from '@hindawi/phenom-events';
import {
  UpdateCatalogItemToCatalogUseCase,
  UpdateCatalogItemToCatalogUseCaseRequestDTO,
} from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/updateCatalogItem/updateCatalogItem';

const JOURNAL_UPDATED = 'JournalUpdated';

export const JournalUpdatedHandler = {
  event: JOURNAL_UPDATED,
  async handler(data: JournalUpdated) {
    const {
      repos: { catalog: catalogRepo, publisher: publisherRepo },
      services: { logger },
    } = this;

    logger.setScope(`PhenomEvent:${JOURNAL_UPDATED}`);
    logger.info(`Incoming Event Data`, data);

    const updateJournalUsecase = new UpdateCatalogItemToCatalogUseCase(
      catalogRepo, publisherRepo
    );

    const result = await updateJournalUsecase.execute({
      // type: ??
      currency: 'USD',
      amount: data.apc,
      created: data.created,
      updated: data.updated,
      issn: data.issn,
      journalTitle: data.name,
      isActive: data.isActive,
      journalId: data.id,
    } as UpdateCatalogItemToCatalogUseCaseRequestDTO);

    if (result.isLeft()) {
      logger.error(result.value.errorValue().message);
      throw result.value.error;
    }
  },
};
