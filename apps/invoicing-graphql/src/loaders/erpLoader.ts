import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { NetSuiteService } from './../services/erp/NetSuiteService';
// import Knex from 'knex';
// import knexTinyLogger from 'knex-tiny-logger';

import { Logger } from '../lib/logger';
import { env } from '../env';

export const erpLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const logger = new Logger();
  logger.setScope('ERP');

  const netSuiteService = NetSuiteService.create({
    connection: {
      account: env.netSuite.account,
      endpoint: env.netSuite.endpoint,
      consumerKey: env.netSuite.consumerKey,
      consumerSecret: env.netSuite.consumerSecret,
      tokenId: env.netSuite.tokenId,
      tokenSecret: env.netSuite.tokenSecret,
    },
  });

  if (settings) {
    settings.setData('netSuite', netSuiteService);
    // settings.onShutdown(() => erpConnection.destroy());
  }
};
