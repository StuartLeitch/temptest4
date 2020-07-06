import { BullScheduler } from '@hindawi/sisif';
import {
  PaymentMethodRepoContract,
  BraintreePaymentBehavior,
  PaymentStrategyFactory,
  PayPalPaymentBehavior,
  ExchangeRateService,
  LoggerBuilder,
  WaiverService,
  EmailService,
  VATService,
  LoggerContract,
} from '@hindawi/shared';

import {
  BraintreeService,
  CheckoutService,
  PayPalService,
  ErpService,
} from '../services';

import { env } from '../env';

import { Repos } from './repo.builder';

export interface Services {
  logger: LoggerContract;
  checkoutService: CheckoutService;
  vatService: VATService;
  waiverService: WaiverService;
  emailService: EmailService;
  exchangeRateService: ExchangeRateService;
  erpService: ErpService;
  schedulingService: BullScheduler;
  paymentStrategyFactory: PaymentStrategyFactory;
}

function buildPaymentStrategyFactory(
  paymentMethodRepo: PaymentMethodRepoContract,
  loggerBuilder: LoggerBuilder
) {
  const paypalService = new PayPalService(
    env.paypal,
    loggerBuilder.getLogger()
  );
  const braintreeService = new BraintreeService(
    env.braintree,
    loggerBuilder.getLogger()
  );

  const payPalPaymentBehavior = new PayPalPaymentBehavior(paypalService);
  const braintreePaymentBehavior = new BraintreePaymentBehavior(
    braintreeService
  );

  return new PaymentStrategyFactory(
    braintreePaymentBehavior,
    payPalPaymentBehavior,
    paymentMethodRepo
  );
}

export function buildServices(
  repos: Repos,
  loggerBuilder: LoggerBuilder
): Services {
  const bullData = env.scheduler.db;

  return {
    logger: loggerBuilder.getLogger(),
    checkoutService: new CheckoutService(),
    vatService: new VATService(),
    waiverService: new WaiverService(repos.waiver, repos.editor),
    emailService: new EmailService(
      env.app.mailingDisabled,
      env.app.FERoot,
      env.app.tenantName
    ),
    exchangeRateService: new ExchangeRateService(),
    erpService: new ErpService(loggerBuilder.getLogger(), env.salesForce),
    schedulingService: new BullScheduler(bullData, loggerBuilder.getLogger()),
    paymentStrategyFactory: buildPaymentStrategyFactory(
      repos.paymentMethod,
      loggerBuilder
    ),
  };
}
