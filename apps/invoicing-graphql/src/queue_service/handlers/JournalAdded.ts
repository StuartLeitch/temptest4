import {
  AddCatalogItemToCatalogUseCase,
  AddCatalogItemToCatalogUseCaseRequestDTO
} from 'libs/shared/src/lib/modules/journals/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalog';

const JOURNAL_ADDED = 'JournalAdded';

export const JournalAddedHandler = {
  event: JOURNAL_ADDED,
  handler: async function(data: any) {
    console.log(`
[JournalAddedHandler Incoming Event Data]:
${JSON.stringify(data)}`);
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
