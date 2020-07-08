/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { BullScheduler } from '@hindawi/sisif';
import {
  BankTransferCaptureMoneyBehavior,
  BraintreeCaptureMoneyBehavior,
  BankTransferPaymentBehavior,
  PayPalCaptureMoneyBehavior,
  PaymentMethodRepoContract,
  SQSPublishServiceContract,
  BraintreePaymentBehavior,
  PaymentStrategyFactory,
  PayPalPaymentBehavior,
  ExchangeRateService,
  LoggerContract,
  LoggerBuilder,
  WaiverService,
  EmailService,
  VATService,
} from '@hindawi/shared';

import {
  BraintreeService,
  NetSuiteService,
  PayPalService,
  ErpService,
} from '../services';

import { env } from '../env';

import { Repos } from './repo.builder';

export interface Services {
  logger: LoggerContract;
  vatService: VATService;
  waiverService: WaiverService;
  emailService: EmailService;
  exchangeRateService: ExchangeRateService;
  schedulingService: BullScheduler;
  paymentStrategyFactory: PaymentStrategyFactory;
  qq: SQSPublishServiceContract;
  erp: {
    sage: ErpService;
    netsuite: NetSuiteService;
  };
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

  const bankTransferCaptureBehavior = new BankTransferCaptureMoneyBehavior();
  const bankTransferPaymentBehavior = new BankTransferPaymentBehavior();
  const paypalCaptureBehavior = new PayPalCaptureMoneyBehavior(paypalService);
  const payPalPaymentBehavior = new PayPalPaymentBehavior(paypalService);
  const braintreeCaptureBehavior = new BraintreeCaptureMoneyBehavior(
    braintreeService
  );
  const braintreePaymentBehavior = new BraintreePaymentBehavior(
    braintreeService
  );

  return new PaymentStrategyFactory(
    bankTransferCaptureBehavior,
    bankTransferPaymentBehavior,
    braintreeCaptureBehavior,
    braintreePaymentBehavior,
    paypalCaptureBehavior,
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
    vatService: new VATService(),
    waiverService: new WaiverService(repos.waiver, repos.editor),
    emailService: new EmailService(
      env.app.mailingDisabled,
      env.app.FERoot,
      env.app.tenantName
    ),
    exchangeRateService: new ExchangeRateService(),
    schedulingService: new BullScheduler(bullData, loggerBuilder.getLogger()),
    paymentStrategyFactory: buildPaymentStrategyFactory(
      repos.paymentMethod,
      loggerBuilder
    ),
    erp: null,
    qq: null,
  };
}
