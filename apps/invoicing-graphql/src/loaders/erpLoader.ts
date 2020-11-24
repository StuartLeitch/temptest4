/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

// import { LoggerBuilder } from '../../../../libs/shared/src/lib/infrastructure/logging/LoggerBuilder';
import { EmptyErpService } from '../../../../libs/shared/src/lib/domain/services/ErpService';

import { ErpReferenceAttributesMapping } from './../services/erp/ReferenceAttributesMap';
import { NetSuiteService } from '../services/erp/NetSuiteService';
import { SageService } from '../services/erp';

import { env } from '../env';
// import { Context } from '../builders';

export const erpLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context = settings.getData('context');
    const emptyErp = new EmptyErpService();

    const loggerBuilder = context.loggerBuilder;

    const netSuiteService = NetSuiteService.create(
      {
        connection: {
          account: env.netSuite.account,
          endpoint: env.netSuite.endpoint,
          consumerKey: env.netSuite.consumerKey,
          consumerSecret: env.netSuite.consumerSecret,
          tokenId: env.netSuite.tokenId,
          tokenSecret: env.netSuite.tokenSecret,
        },
        referenceMappings: ErpReferenceAttributesMapping.netsuite,
      },
      loggerBuilder
    );

    const sageService = new SageService(
      loggerBuilder.getLogger(),
      env.salesForce,
      ErpReferenceAttributesMapping.sage
    );

    context.services.erp = {
      sage: env.salesForce.sageEnabled ? sageService : emptyErp,
      netsuite: env.netSuite.netSuiteEnabled ? netSuiteService : emptyErp,
    };
    // settings.onShutdown(() => erpConnection.destroy());
  }
};
