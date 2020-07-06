import { SQSPublishServiceContract } from '@hindawi/shared';

import { Services } from './service.builder';
import { Repos } from './repo.builder';

export interface Context {
  qq: SQSPublishServiceContract;
  services: Services;
  repos: Repos;
}

export * from './service.builder';
export * from './repo.builder';
