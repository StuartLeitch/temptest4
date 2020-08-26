/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { BullScheduler } from '@hindawi/sisif';
import {
  PaymentMethodRepoContract,
  SQSPublishServiceContract,
  PaymentStrategyFactory,
  BraintreeClientToken,
  ExchangeRateService,
  PayPalCaptureMoney,
  EmptyCaptureMoney,
  BraintreePayment,
  EmptyClientToken,
  IdentityPayment,
  LoggerContract,
  LoggerBuilder,
  PayPalPayment,
  WaiverService,
  EmailService,
  VATService,
  createPdfGenerator,
  PdfGeneratorService,
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
  pdfGenerator: PdfGeneratorService;
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

  const braintreeClientToken = new BraintreeClientToken(braintreeService);
  const braintreePayment = new BraintreePayment(braintreeService);
  const paypalCapture = new PayPalCaptureMoney(paypalService);
  const payPalPayment = new PayPalPayment(paypalService);
  const emptyClientToken = new EmptyClientToken();
  const identityPayment = new IdentityPayment();
  const emptyCapture = new EmptyCaptureMoney();

  return new PaymentStrategyFactory(
    braintreeClientToken,
    braintreePayment,
    emptyClientToken,
    paypalCapture,
    identityPayment,
    emptyCapture,
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
    pdfGenerator: createPdfGenerator(loggerBuilder.getLogger()),
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
