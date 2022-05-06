
import { LoggerBuilderContract } from '@hindawi/shared';

import { Services } from './services';

export interface Context {
  loggerBuilder: LoggerBuilderContract;
  services: Services;
}

export * from './services';
