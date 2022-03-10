import { CatalogItem } from './CatalogItem';

export interface CatalogPaginated {
  catalogItems: Array<CatalogItem>;
  totalCount: number;
}
