import { RetryRevenueRecognitionReversalsNetsuiteErpUsecase } from '@hindawi/shared';

import { Context } from '../builders';

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterRevenueRecognitionReversalsCron {
  public static async schedule(context: Context): Promise<any> {
    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    const {
      services: { logger: loggerService },
    } = context;
    loggerService.setScope('cron:registerRevenueRecognitionReversals');

    if (
      !FeatureFlags.isFeatureEnabled('erpRegisterRevenueRecognitionReversalsEnabled')
    ) {
      return loggerService.debug(
        'Skipping the CRON Job revenue recognition reversals registration scheduling...'
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

    const retryRevenueRecognizedReversalsToNetsuiteErpUsecase = new RetryRevenueRecognitionReversalsNetsuiteErpUsecase(
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

    const maybeResponse = await retryRevenueRecognizedReversalsToNetsuiteErpUsecase.execute();
    if (maybeResponse.isLeft()) {
      loggerService.error(maybeResponse.value.message);
      throw maybeResponse.value;
    }
  }
}
