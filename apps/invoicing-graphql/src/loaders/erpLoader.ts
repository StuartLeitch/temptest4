/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import { LoggerBuilder } from './../../../../libs/shared/src/lib/infrastructure/logging/LoggerBuilder';
import { ErpService } from '../services/erp';
import { NetSuiteService } from './../services/erp/NetSuiteService';

import { env } from '../env';

export const erpLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const loggerBuilder = new LoggerBuilder();
  const logger = loggerBuilder.getLogger();
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
  const sageService = new ErpService(loggerBuilder.getLogger(), env.salesForce);

  if (settings) {
    const context = settings.getData('context');

    context.services.erp = {
      sage: sageService,
      netsuite: netSuiteService,
    };

    await netSuiteService.registerCustomer({});

    // settings.onShutdown(() => erpConnection.destroy());
  }
};
