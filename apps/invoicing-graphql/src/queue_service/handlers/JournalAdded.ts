import {
  AddCatalogItemToCatalogUseCase,
  AddCatalogItemToCatalogUseCaseRequestDTO
} from '../../../../../libs/shared/src/lib/modules/journals/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalog';
import { Logger } from '../../lib/logger';

const JOURNAL_ADDED = 'JournalAdded';
const logger = new Logger(`events:${JOURNAL_ADDED}`);

export const JournalAddedHandler = {
  event: JOURNAL_ADDED,
  async handler(data: any) {
    logger.info(`Incoming Event Data`, data);
    const {
      repos: { catalog: catalogRepo }
    } = this;

    const addJournalUsecase = new AddCatalogItemToCatalogUseCase(catalogRepo);
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
        journalId: data.id
      } as AddCatalogItemToCatalogUseCaseRequestDTO);

      if (result.isLeft()) {
        console.error(result.value.error);
      }
    } catch (error) {
      console.error(error);
    }
  }
};
