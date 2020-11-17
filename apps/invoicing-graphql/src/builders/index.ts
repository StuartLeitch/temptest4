import { Services } from './service.builder';
import { Repos } from './repo.builder';
import { LoggerBuilderContract } from '@hindawi/shared';

export interface Context {
  services: Services;
  repos: Repos;
  loggerBuilder: LoggerBuilderContract;
}

export * from './service.builder';
export * from './repo.builder';
