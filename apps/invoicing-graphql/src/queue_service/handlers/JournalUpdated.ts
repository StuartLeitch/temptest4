/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { JournalUpdated } from '@hindawi/phenom-events';

import { UpdateCatalogItemToCatalogUseCase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/updateCatalogItem/updateCatalogItem';

import { Context } from '../../builders';

import { EventHandler } from '../event-handler';

const JOURNAL_UPDATED = 'JournalUpdated';

export const JournalUpdatedHandler: EventHandler<JournalUpdated> = {
  event: JOURNAL_UPDATED,
  handler(context: Context) {
    return async (data: JournalUpdated) => {
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

      console.log('----------- journal updated -----------');
      console.log(JSON.stringify(data, null, 2));
      console.log('------------------end----------------');

      const result = await updateJournalUsecase.execute({
        type: null,
        currency: 'USD',
        amount: data.apc,
        created: data.created,
        updated: data.updated,
        issn: data.issn,
        journalTitle: data.name,
        isActive: data.isActive,
        journalId: data.id,
      });

      if (result.isLeft()) {
        logger.error(result.value.errorValue().message);
        throw result.value.error;
      }
    };
  },
};
