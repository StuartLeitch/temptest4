// import { env } from '../env';
import { RetryRevenueRecognitionSageErpInvoicesUsecase } from '@hindawi/shared';

import { Logger } from '../lib/logger';
import { Context } from '../builders';

const logger = new Logger();
logger.setScope('cron:registerRevenueRecognitionForSage');

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterRevenueRecognitionsForSageCron {
  public static async schedule(context: Context): Promise<any> {
    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (
      !FeatureFlags.isFeatureEnabled('erpRegisterRevenueRecognitionEnabled')
    ) {
      return logger.warn(
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
      },
      services: { erp, logger: loggerService },
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
      erp?.sage || null,
      loggerService
    );

    const maybeResponse = await retryRevenueRecognitionSageErpInvoicesUsecase.execute();
    if (maybeResponse.isLeft()) {
      logger.error(maybeResponse.value.errorValue().message);
      throw maybeResponse.value;
    }
  }
}
