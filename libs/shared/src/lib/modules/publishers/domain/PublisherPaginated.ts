import { Publisher } from './Publisher';

export interface PublisherPaginated {
  publishers: Array<Publisher>;
  totalCount: number;
}
