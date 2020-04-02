import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

// import { CorrelationID } from '../../../../libs/shared/src/lib/core/domain/CorrelationID';

import {
  KnexPaymentMethodRepo,
  KnexAddressRepo,
  KnexArticleRepo,
  KnexInvoiceItemRepo,
  KnexInvoiceRepo,
  KnexTransactionRepo,
  KnexPaymentRepo,
  KnexPayerRepo,
  KnexWaiverRepo,
  KnexCatalogRepo,
  VATService,
  WaiverService,
  EmailService,
  KnexEditorRepo,
  KnexCouponRepo,
  KnexPublisherRepo,
  KnexSentNotificationsRepo,
  KnexPausedReminderRepo,
  ExchangeRateService
} from '@hindawi/shared';

// import {  } from '../../../../libs/shared/src/lib/domain/services/ExchangeRateService';
import { CheckoutService } from '../services/checkout';
// import { AuthService } from '../services/auth';
import { PayPalService } from '../services/paypal';
import { ErpService } from '../services/erp';
import { Logger } from '../lib/logger';

import { env } from '../env';
import { BullScheduler } from '@hindawi/sisif';

export const contextLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');
    const logger = new Logger();

    const repos = {
      address: new KnexAddressRepo(db),
      catalog: new KnexCatalogRepo(db),
      invoice: new KnexInvoiceRepo(db, logger),
      invoiceItem: new KnexInvoiceItemRepo(db, logger),
      transaction: new KnexTransactionRepo(db, logger),
      payer: new KnexPayerRepo(db),
      payment: new KnexPaymentRepo(db),
      paymentMethod: new KnexPaymentMethodRepo(db, logger),
      waiver: new KnexWaiverRepo(db),
      manuscript: new KnexArticleRepo(db, logger),
      editor: new KnexEditorRepo(db),
      coupon: new KnexCouponRepo(db),
      publisher: new KnexPublisherRepo(db),
      sentNotifications: new KnexSentNotificationsRepo(db),
      pausedReminder: new KnexPausedReminderRepo(db)
    };

    const bullData = {
      password: env.scheduler.db.password,
      host: env.scheduler.db.host,
      port: env.scheduler.db.port
    };

    const services = {
      logger,
      checkoutService: new CheckoutService(),
      // authService: new AuthService({}),
      vatService: new VATService(env.app.vatValidationServiceEndpoint),
      waiverService: new WaiverService(repos.waiver, repos.editor),
      emailService: new EmailService(
        env.app.mailingDisabled,
        env.app.FERoot,
        env.app.tenantName
      ),
      exchangeRateService: new ExchangeRateService(),
      payPalService: new PayPalService(env.paypal),
      erpService: new ErpService(logger, env.salesForce),
      schedulingService: new BullScheduler(bullData, logger)
    };

    const context = {
      repos,
      services
    };

    settings.setData('context', context);
  }
};
