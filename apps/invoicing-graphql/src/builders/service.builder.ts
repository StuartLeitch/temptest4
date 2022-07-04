import { createQueueService } from '@hindawi/queue-service';
import { BullScheduler } from '@hindawi/sisif';
import {
  AbstractApiExchangeRateService,
  PaymentMethodRepoContract,
  PaymentStrategyFactory,
  BraintreeClientToken,
  PdfGeneratorService,
  createPdfGenerator,
  PayPalCaptureMoney,
  EmptyCaptureMoney,
  BraintreePayment,
  EmptyClientToken,
  IdentityPayment,
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
  exchangeRateService: AbstractApiExchangeRateService;
  paymentStrategyFactory: PaymentStrategyFactory;
  pdfGenerator: PdfGeneratorService;
  schedulingService: BullScheduler;
  queue: PhenomSqsServiceContract;
  waiverService: WaiverService;
  emailService: EmailService;
  vatService: VATService;
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
    loggerBuilder.getLogger(PayPalService.name)
  );
  const braintreeService = new BraintreeService(
    env.braintree,
    loggerBuilder.getLogger(BraintreeService.name)
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
  const logger = loggerBuilder.getLogger('setupQueueService');
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
    defaultMessageAttributes: JSON.parse(env.app.defaultMessageAttributes),
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
    pdfGenerator: createPdfGenerator(
      loggerBuilder.getLogger('createPdfGenerator')
    ),
    vatService: new VATService(),
    waiverService: new WaiverService(
      repos.invoiceItem,
      repos.editor,
      repos.waiver
    ),
    emailService: new EmailService(
      env.app.mailingDisabled,
      env.app.FERoot,
      env.app.tenantName,
      env.antiFraud.supportEmail,
      env.antiFraud.policyUrl
    ),
    schedulingService: sisifEnabled
      ? new BullScheduler(bullData, loggerBuilder.getLogger(BullScheduler.name))
      : null,
    paymentStrategyFactory: buildPaymentStrategyFactory(
      repos.paymentMethod,
      loggerBuilder
    ),
    erp: null,
    queue: env.loaders.queueServiceEnabled
      ? await setupQueueService(loggerBuilder)
      : null,
    exchangeRateService: new AbstractApiExchangeRateService(
      repos.exchangeRate,
      loggerBuilder.getLogger(AbstractApiExchangeRateService.name),
      env.app.abstractApiKey
    ),
  };
}
