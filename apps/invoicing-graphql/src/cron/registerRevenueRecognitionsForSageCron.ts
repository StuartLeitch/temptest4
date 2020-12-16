// import { env } from '../env';
import { RetryRevenueRecognitionSageErpInvoicesUsecase } from '@hindawi/shared';

import { Context } from '../builders';

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterRevenueRecognitionsForSageCron {
  public static async schedule(context: Context): Promise<any> {
    const {
      services: { logger: loggerService },
    } = context;
    loggerService.setScope('cron:registerRevenueRecognitionForSage');

    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (
      !FeatureFlags.isFeatureEnabled('erpRegisterRevenueRecognitionEnabled')
    ) {
      return loggerService.warn(
        'Skipping the CRON Job revenue recognitions registration for Sage scheduling...'
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

    const retryRevenueRecognitionSageErpInvoicesUsecase = new RetryRevenueRecognitionSageErpInvoicesUsecase(
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
      erp?.sage || null,
      loggerService
    );

    const maybeResponse = await retryRevenueRecognitionSageErpInvoicesUsecase.execute();
    if (maybeResponse.isLeft()) {
      loggerService.error(maybeResponse.value.errorValue().message);
      throw maybeResponse.value;
    }
  }
}
