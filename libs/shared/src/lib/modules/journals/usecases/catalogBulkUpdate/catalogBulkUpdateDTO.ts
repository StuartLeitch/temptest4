export interface CatalogBulkUpdateItemDTO {
  journalId?: string;
  amount?: string;
}

export interface CatalogBulkUpdateDTO {
  catalogItems: Array<CatalogBulkUpdateItemDTO>;
}
