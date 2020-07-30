/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { BullScheduler } from '@hindawi/sisif';
import {
  BankTransferCreateClientTokenBehavior,
  BraintreeCreateClientTokenBehavior,
  BankTransferCaptureMoneyBehavior,
  PayPalCreateClientTokenBehavior,
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
  SageService,
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
    sage: SageService;
    netsuite: NetSuiteService;
  };
}

function buildPaymentStrategyFactory(
  paymentMethodRepo: PaymentMethodRepoContract,
  loggerBuilder: LoggerBuilder,
  repos: Repos
) {
  const paypalService = new PayPalService(
    env.paypal,
    repos.paymentMethod,
    repos.invoice,
    repos.payment,
    loggerBuilder.getLogger()
  );
  const braintreeService = new BraintreeService(
    env.braintree,
    loggerBuilder.getLogger()
  );

  const bankTransferClientToken = new BankTransferCreateClientTokenBehavior();
  const bankTransferCapture = new BankTransferCaptureMoneyBehavior();
  const bankTransferPayment = new BankTransferPaymentBehavior();
  const paypalClientToken = new PayPalCreateClientTokenBehavior(paypalService);
  const paypalCapture = new PayPalCaptureMoneyBehavior(paypalService);
  const payPalPayment = new PayPalPaymentBehavior(paypalService);
  const braintreeCapture = new BraintreeCaptureMoneyBehavior(braintreeService);
  const braintreePayment = new BraintreePaymentBehavior(braintreeService);
  const braintreeClientToken = new BraintreeCreateClientTokenBehavior(
    braintreeService
  );

  return new PaymentStrategyFactory(
    bankTransferClientToken,
    bankTransferCapture,
    bankTransferPayment,
    braintreeClientToken,
    braintreeCapture,
    braintreePayment,
    paypalClientToken,
    paypalCapture,
    payPalPayment,
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
      loggerBuilder,
      repos
    ),
    erp: null,
    qq: null,
  };
}
