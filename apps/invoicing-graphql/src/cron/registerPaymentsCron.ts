import { RetryPaymentsRegistrationToErpUsecase, Roles } from '@hindawi/shared';

import { Context } from '../builders';

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterPaymentsCron {
  public static async schedule(context: Context): Promise<any> {
    const { loggerBuilder } = context;

    const loggerService = loggerBuilder.getLogger('cron:registerPayments');

    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (!FeatureFlags.isFeatureEnabled('erpRegisterPaymentsEnabled')) {
      return loggerService.debug(
        'Skipping the CRON Job payments registration scheduling...'
      );
    }

    const {
      repos: {
        invoiceItem,
        manuscript,
        catalog,
        invoice,
        coupon,
        waiver,
        payer,
        payment,
        paymentMethod,
        erpReference,
      },
      services: { erp },
    } = context;

    const retryPaymentsToNetsuiteErpUsecase =
      new RetryPaymentsRegistrationToErpUsecase(
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
        loggerService
      );

    const maybeResponse = await retryPaymentsToNetsuiteErpUsecase.execute(
      null,
      { roles: [Roles.CHRON_JOB] }
    );
    if (maybeResponse.isLeft()) {
      loggerService.error(maybeResponse.value.message);
      throw maybeResponse.value;
    }
  }
}
