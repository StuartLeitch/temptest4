/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  UpdateCatalogItemToCatalogUseCase,
  UpdateCatalogItemToCatalogUseCaseRequestDTO,
} from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/updateCatalogItem/updateCatalogItem';

const JOURNAL_UPDATED = 'JournalUpdated';

export const JournalUpdatedHandler = {
  event: JOURNAL_UPDATED,
  async handler(data: any) {
    const {
      repos: { catalog: catalogRepo },
      services: { logger },
    } = this;

    logger.setScope(`PhenomEvent:${JOURNAL_UPDATED}`);
    logger.info(`Incoming Event Data`, data);

    const addJournalUsecase = new UpdateCatalogItemToCatalogUseCase(
      catalogRepo
    );

    const result = await addJournalUsecase.execute({
      // type: ??
      amount: data.apc,
      created: data.created,
      updated: data.updated,
      currency: 'USD',
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
