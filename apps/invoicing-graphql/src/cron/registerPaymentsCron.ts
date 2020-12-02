// import { env } from '../env';
import { RetryPaymentsRegistrationToErpUsecase } from '@hindawi/shared';

import { Logger } from '../lib/logger';
import { Context } from '../builders';

const logger = new Logger();
logger.setScope('cron:registerCreditMemos');

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterPaymentsCron {
  public static async schedule(context: Context): Promise<any> {
    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (!FeatureFlags.isFeatureEnabled('erpRegisterPaymentsEnabled')) {
      return logger.debug(
        'Skipping the CRON Job payments registration scheduling...'
      );
    }

    const {
      repos: {
        invoiceItem,
        manuscript,
        publisher,
        catalog,
        invoice,
        coupon,
        waiver,
        payer,
        payment,
        paymentMethod,
        erpReference,
      },
      services: { erp, logger: loggerService },
    } = context;

    const retryPaymentsToNetsuiteErpUsecase = new RetryPaymentsRegistrationToErpUsecase(
      invoice,
      invoiceItem,
      payment,
      paymentMethod,
      coupon,
      waiver,
      payer,
      manuscript,
      catalog,
      erpReference,
      erp?.netsuite || null,
      publisher,
      loggerService
    );

    const maybeResponse = await retryPaymentsToNetsuiteErpUsecase.execute();
    if (maybeResponse.isLeft()) {
      logger.error(maybeResponse.value.errorValue().message);
      throw maybeResponse.value;
    }
  }
}
