/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { createQueueService } from '@hindawi/queue-service';
import { BullScheduler } from '@hindawi/sisif';
import {
  PaymentMethodRepoContract,
  PaymentStrategyFactory,
  BraintreeClientToken,
  ExchangeRateService,
  PdfGeneratorService,
  createPdfGenerator,
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
} from '@hindawi/shared';

import { PhenomSqsServiceContract } from '../queue_service/phenom-queue-service';

import { BraintreeService, NetSuiteService, PayPalService } from '../services';

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
  qq: PhenomSqsServiceContract;
  erp: {
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

async function setupQueueService(loggerBuilder: LoggerBuilder) {
  const logger = loggerBuilder.getLogger();
  const config = {
    region: env.aws.sns.sqsRegion,
    accessKeyId: env.aws.sns.sqsAccessKey,
    secretAccessKey: env.aws.sns.sqsSecretKey,
    snsEndpoint: env.aws.sns.endpoint,
    sqsEndpoint: env.aws.sqs.endpoint,
    s3Endpoint: env.aws.s3.endpoint,
    topicName: env.aws.sns.topic,
    queueName: env.aws.sqs.queueName,
    bucketName: env.aws.s3.largeEventBucket,
    bucketPrefix: env.aws.s3.bucketPrefix,
    eventNamespace: env.app.eventNamespace,
    publisherName: env.app.publisherName,
    serviceName: env.app.name,
  };

  let queue: PhenomSqsServiceContract;
  try {
    queue = await createQueueService(config);
  } catch (err) {
    logger.error(err);
  }

  return queue;
}

export async function buildServices(
  repos: Repos,
  loggerBuilder: LoggerBuilder
): Promise<Services> {
  const bullData = env.scheduler.db;
  const { sisifEnabled } = env.loaders;

  return {
    logger: loggerBuilder.getLogger(),
    pdfGenerator: createPdfGenerator(loggerBuilder.getLogger()),
    vatService: new VATService(),
    waiverService: new WaiverService(
      repos.invoiceItem,
      repos.editor,
      repos.waiver
    ),
    emailService: new EmailService(
      env.app.mailingDisabled,
      env.app.FERoot,
      env.app.tenantName
    ),
    exchangeRateService: new ExchangeRateService(),
    schedulingService: sisifEnabled
      ? new BullScheduler(bullData, loggerBuilder.getLogger())
      : null,
    paymentStrategyFactory: buildPaymentStrategyFactory(
      repos.paymentMethod,
      loggerBuilder
    ),
    erp: null,
    qq: env.loaders.queueServiceEnabled
      ? await setupQueueService(loggerBuilder)
      : null,
  };
}
