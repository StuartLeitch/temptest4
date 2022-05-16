import { RetryFailedNetsuiteErpInvoicesUsecase, Roles } from '@hindawi/shared';

import { Context } from '../builders';

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterInvoicesCron {
  public static async schedule(context: Context): Promise<any> {
    const {
      services: { logger: loggerService },
    } = context;
    loggerService.setScope('cron:registerInvoices');

    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (!FeatureFlags.isFeatureEnabled('erpRegisterInvoicesEnabled')) {
      return loggerService.debug(
        'Skipping the CRON Job invoices registration scheduling...'
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
      services: { erp, vatService },
    } = context;

    const retryFailedNetsuiteErpInvoicesUsecase =
      new RetryFailedNetsuiteErpInvoicesUsecase(
        invoice,
        invoiceItem,
        coupon,
        waiver,
        payer,
        address,
        manuscript,
        catalog,
        erpReference,
        erp?.netsuite || null,
        publisher,
        loggerService,
        vatService
      );

    const maybeResponse = await retryFailedNetsuiteErpInvoicesUsecase.execute(
      null,
      { roles: [Roles.CHRON_JOB] }
    );
    if (maybeResponse.isLeft()) {
      loggerService.error(maybeResponse.value.message);
      throw maybeResponse.value;
    }
  }
}
