import { Repo } from '../../../infrastructure/Repo';

import { PublisherCustomValues } from '../domain/PublisherCustomValues';
import { PublisherId } from '../domain/PublisherId';
import { Publisher } from '../domain/Publisher';

export interface PublisherRepoContract extends Repo<Publisher> {
  getCustomValuesByPublisherId(id: PublisherId): Promise<PublisherCustomValues>;
  getPublisherById(id: PublisherId): Promise<Publisher>;
}
