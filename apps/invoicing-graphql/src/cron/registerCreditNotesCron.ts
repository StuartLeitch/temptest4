import { RetryCreditNotesUsecase, Roles } from '@hindawi/shared';

import { Context } from '../builders';

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterCreditNotesCron {
  public static async schedule(context: Context): Promise<any> {
    const {
      services: { logger: loggerService },
    } = context;
    loggerService.setScope('cron:registerCreditMemos');

    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (!FeatureFlags.isFeatureEnabled('erpRegisterCreditNotesEnabled')) {
      return loggerService.debug(
        'Skipping the CRON Job credit notes registration scheduling...'
      );
    }

    const {
      repos: { invoiceItem, invoice, coupon, waiver, erpReference },
      services: { erp },
    } = context;

    const retryRevenueRecognizedInvoicesToNetsuiteErpUsecase = new RetryCreditNotesUsecase(
      invoice,
      invoiceItem,
      coupon,
      waiver,
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
