import { CatalogItem } from './CatalogItem';
import { PublisherPaginated } from '../../publishers/domain/PublisherPaginated';

export interface CatalogPaginated {
  catalogItems: Array<CatalogItem>;
  totalCount: number;
  publishers: PublisherPaginated;
}
