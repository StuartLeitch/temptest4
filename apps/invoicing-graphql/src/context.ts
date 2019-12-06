import Knex from 'knex';
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
  KnexEditorRepo
} from '@hindawi/shared';
import { Config } from './config';
import { CheckoutService } from './services/checkout';
import { AuthService } from './services/auth';
import { ExchangeRateService } from './../../../libs/shared/src/lib/domain/services/ExchangeRateService';
import { ErpService } from './services/erp';

const checkoutNodeJsSDK = require('@paypal/checkout-server-sdk');

export interface ReposContext {
  address: KnexAddressRepo;
  invoice: KnexInvoiceRepo;
  catalog: KnexCatalogRepo;
  editor: KnexEditorRepo;
  invoiceItem: KnexInvoiceItemRepo;
  transaction: KnexTransactionRepo;
  payer: KnexPayerRepo;
  payment: KnexPaymentRepo;
  paymentMethod: KnexPaymentMethodRepo;
  waiver: KnexWaiverRepo;
  manuscript: KnexArticleRepo;
}

export interface Context {
  repos: ReposContext;
  checkoutService: CheckoutService;
  authService: AuthService;
  vatService: VATService;
  waiverService: WaiverService;
  payPalService: any;
  emailService: EmailService;
  exchangeRateService: ExchangeRateService;
  erpService: ErpService;
  qq?: any;
}

function makePayPalEnvironment(
  clientId: string,
  clientSecret: string,
  environment: string
) {
  if (environment === 'live' || environment === 'production') {
    return new checkoutNodeJsSDK.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJsSDK.core.SandboxEnvironment(
      clientId,
      clientSecret
    );
  }
}

function makePayPal(config: Config) {
  const { clientId, environment, clientSecret } = config.payPal;
  return new checkoutNodeJsSDK.core.PayPalHttpClient(
    makePayPalEnvironment(clientId, clientSecret, environment)
  );
}

export function makeContext(config: Config, db: Knex): Context {
  return {
    repos: {
      address: new KnexAddressRepo(db),
      catalog: new KnexCatalogRepo(db),
      invoice: new KnexInvoiceRepo(db),
      invoiceItem: new KnexInvoiceItemRepo(db),
      transaction: new KnexTransactionRepo(db),
      payer: new KnexPayerRepo(db),
      payment: new KnexPaymentRepo(db),
      paymentMethod: new KnexPaymentMethodRepo(db),
      waiver: new KnexWaiverRepo(db),
      manuscript: new KnexArticleRepo(db),
      editor: new KnexEditorRepo(db)
    },
    checkoutService: new CheckoutService(),
    authService: new AuthService(config),
    vatService: new VATService(),
    waiverService: new WaiverService(),
    payPalService: () => makePayPal(config),
    emailService: new EmailService(),
    exchangeRateService: new ExchangeRateService(),
    erpService: new ErpService(config)
  };
}
