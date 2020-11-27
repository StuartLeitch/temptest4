// import { env } from '../env';
import { RetryFailedSageErpInvoicesUsecase } from '@hindawi/shared';

import { Logger } from '../lib/logger';
import { Context } from '../builders';

const logger = new Logger();
logger.setScope('cron:registerInvoicesForSage');

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterInvoicesForSageCron {
  public static async schedule(context: Context): Promise<any> {
    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (!FeatureFlags.isFeatureEnabled('erpRegisterInvoicesEnabled')) {
      return logger.debug(
        'Skipping the CRON Job invoices registration for Sage scheduling...'
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
      services: { erp, logger: loggerService, vatService },
    } = context;

    const retryFailedSageErpInvoicesUsecase = new RetryFailedSageErpInvoicesUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
      payer,
      address,
      manuscript,
      catalog,
      erpReference,
      erp?.sage || null,
      publisher,
      loggerService,
      vatService
    );

    const maybeResponse = await retryFailedSageErpInvoicesUsecase.execute();
    if (maybeResponse.isLeft()) {
      logger.error(maybeResponse.value.errorValue().message);
      throw maybeResponse.value;
    }
  }
}
