import { CatalogItem } from '../../../../journals/domain/CatalogItem';

export interface PublishJournalUpdatedDTO {
  journal: CatalogItem;
  messageTimestamp?: Date;
}
