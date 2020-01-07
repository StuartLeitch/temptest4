import {
  UpdateCatalogItemToCatalogUseCase,
  UpdateCatalogItemToCatalogUseCaseRequestDTO
} from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/updateCatalogItem/updateCatalogItem';
import { Logger } from '../../lib/logger';

const JOURNAL_UPDATED = 'JournalUpdated';
const logger = new Logger(`events:${JOURNAL_UPDATED}`);

export const JournalUpdatedHandler = {
  event: JOURNAL_UPDATED,
  async handler(data: any) {
    logger.info(`Incoming Event Data`, data);
    const {
      repos: { catalog: catalogRepo }
    } = this;

    const addJournalUsecase = new UpdateCatalogItemToCatalogUseCase(
      catalogRepo
    );

    try {
      const result = await addJournalUsecase.execute({
        // type: ??
        amount: data.apc,
        created: data.created,
        updated: data.updated,
        currency: 'USD',
        issn: data.issn,
        journalTitle: data.name,
        isActive: data.isActive,
        journalId: data.id
      } as UpdateCatalogItemToCatalogUseCaseRequestDTO);

      if (result.isLeft()) {
        console.error(result.value.error);
      }
    } catch (error) {
      console.error(error);
    }
  }
};
