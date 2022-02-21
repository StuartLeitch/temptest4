/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { EmptyErpService } from '../../../../libs/shared/src/lib/domain/services/ErpService';

import { ErpReferenceAttributesMapping } from './../services/erp/ReferenceAttributesMap';
import { NetSuiteService } from '../services/erp';

import { env } from '../env';

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
      loggerBuilder,
      env.netSuite.customSegmentFieldName,
      env.netSuite.customExternalPaymentReference,
      env.netSuite.customUniquePaymentReference,
      env.netSuite.netsuiteTaxDetailsUkStandard,
      env.netSuite.netsuiteTaxDetailsUkZero,
      env.netSuite.netsuitePaymentAccountCodes
    );

    context.services.erp = {
      netsuite: env.netSuite.netSuiteEnabled ? netSuiteService : emptyErp,
    };
  }
};
