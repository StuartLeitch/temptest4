import {
  UpdateCatalogItemToCatalogUseCase,
  UpdateCatalogItemToCatalogUseCaseRequestDTO
} from 'libs/shared/src/lib/modules/journals/usecases/catalogItems/updateCatalogItem/updateCatalogItem';

const JOURNAL_UPDATED = 'JournalUpdated';

export const JournalUpdatedHandler = {
  event: JOURNAL_UPDATED,
  handler: async function(data: any) {
    console.log(`
[JournalUpdatedHandler Incoming Event Data]:
${JSON.stringify(data)}`);
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
