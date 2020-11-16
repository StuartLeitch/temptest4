// import { env } from '../env';
import { RegisterErpCreditMemosUsecase } from '@hindawi/shared';

import { Logger } from '../lib/logger';
import { Context } from '../builders';

const logger = new Logger();
logger.setScope('cron:registerCreditMemos');

import { FeatureFlags } from '../lib/FeatureFlags';
import { CronFeatureFlagsReader } from './CronFeatureFlagsReader';

export class RegisterCreditMemosCron {
  public static async schedule(context: Context): Promise<any> {
    const cronFlags = CronFeatureFlagsReader.readAll();
    FeatureFlags.setFeatureFlags(cronFlags);

    if (!FeatureFlags.isFeatureEnabled('erpRegisterCreditMemosEnabled')) {
      return logger.debug(
        'Skipping the CRON Job credit memos registration scheduling...'
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
      services: { erp, logger: loggerService, vatService },
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
      erp?.netsuite || null,
      loggerService
    );

    const maybeResponse = await retryRevenueRecognizedInvoicesToNetsuiteErpUsecase.execute();
    if (maybeResponse.isLeft()) {
      logger.error(maybeResponse.value.errorValue().message);
      throw maybeResponse.value;
    }
  }
}
