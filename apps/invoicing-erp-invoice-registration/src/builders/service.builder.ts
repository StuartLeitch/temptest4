/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Consumer } from 'sqs-consumer';

import {
  ExchangeRateService,
  LoggerContract,
  LoggerBuilder,
  VATService,
} from '@hindawi/shared';

import { NetSuiteService } from '../services';

import { env } from '../env';

import { Repos } from './repo.builder';

export interface Services {
  logger: LoggerContract;
  vatService: VATService;
  exchangeRateService: ExchangeRateService;
  qq: Consumer;
  erp: {
    netsuite: NetSuiteService;
  };
}

export async function buildServices(
  repos: Repos,
  loggerBuilder: LoggerBuilder
): Promise<Services> {
  return {
    logger: loggerBuilder.getLogger(),
    vatService: new VATService(),
    exchangeRateService: new ExchangeRateService(),
    erp: null,
    qq: null,
  };
}
