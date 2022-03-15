import { CatalogItem } from '../../../domain/CatalogItem';

export interface PublishJournalAPCUpdatedDTO {
  journal: CatalogItem;
  messageTimestamp?: Date;
}
