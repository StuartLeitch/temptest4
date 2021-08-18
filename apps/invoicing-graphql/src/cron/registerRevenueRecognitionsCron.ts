import {
  RetryRevenueRecognitionNetsuiteErpInvoicesUsecase,
  Roles,
} from '@hindawi/shared';

import { Context } from '../builders';

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterRevenueRecognitionsCron {
  public static async schedule(context: Context): Promise<any> {
    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    const {
      services: { logger: loggerService },
    } = context;
    loggerService.setScope('cron:registerRevenueRecognition');

    if (
      !FeatureFlags.isFeatureEnabled('erpRegisterRevenueRecognitionEnabled')
    ) {
      return loggerService.debug(
        'Skipping the CRON Job revenue recognitions registration scheduling...'
      );
    }

    const {
      repos: {
        invoiceItem,
        manuscript,
        publisher,
        address,
        catalog,
        invoice,
        coupon,
        waiver,
        payer,
        erpReference,
      },
      services: { erp },
    } = context;

    const retryRevenueRecognizedInvoicesToNetsuiteErpUsecase = new RetryRevenueRecognitionNetsuiteErpInvoicesUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      publisher,
      erpReference,
      erp?.netsuite || null,
      loggerService
    );

    const maybeResponse = await retryRevenueRecognizedInvoicesToNetsuiteErpUsecase.execute(
      null,
      { roles: [Roles.CHRON_JOB] }
    );
    if (maybeResponse.isLeft()) {
      loggerService.error(maybeResponse.value.message);
      throw maybeResponse.value;
    }
  }
}
