/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import sinon from 'sinon';
import {
  BraintreeClientToken,
  BraintreePayment,
  EmptyCaptureMoney,
  EmptyClientToken,
  IdentityPayment,
  MockAddressRepo,
  MockArticleRepo,
  MockCatalogRepo,
  MockCouponRepo,
  MockEditorRepo,
  MockInvoiceItemRepo,
  MockInvoiceRepo,
  MockLogger,
  MockPayerRepo,
  // MockSentNotificationsRepo,
  // MockPausedReminderRepo,
  MockPaymentMethodRepo,
  MockPaymentRepo,
  MockPublisherRepo,
  MockTransactionRepo,
  MockWaiverRepo,
  PaymentStrategyFactory,
  PayPalCaptureMoney,
  PayPalPayment,
  MockPayPalService,
  MockBraintreeService,
} from '../../src';

export interface MockRepos {
  address: MockAddressRepo;
  catalog: MockCatalogRepo;
  invoice: MockInvoiceRepo;
  invoiceItem: MockInvoiceItemRepo;
  transaction: MockTransactionRepo;
  payer: MockPayerRepo;
  payment: MockPaymentRepo;
  paymentMethod: MockPaymentMethodRepo;
  waiver: MockWaiverRepo;
  manuscript: MockArticleRepo;
  editor: MockEditorRepo;
  coupon: MockCouponRepo;
  publisher: MockPublisherRepo;
  // sentNotifications: MockSentNotificationsRepo;
  // pausedReminder: MockPausedReminderRepo;
}

export interface MockServices {
  paymentStrategyFactory: PaymentStrategyFactory;
  logger: MockLogger;
}

export interface MockContext {
  repos: MockRepos;
  services: MockServices;
}

export function buildMockServices(repos: MockRepos): MockServices {
  const braintreeService = new MockBraintreeService();
  const paypalService = new MockPayPalService();

  const braintreeClientToken = new BraintreeClientToken(braintreeService);
  const braintreePayment = new BraintreePayment(braintreeService);
  const paypalCapture = new PayPalCaptureMoney(paypalService);
  const payPalPayment = new PayPalPayment(paypalService);
  const emptyClientToken = new EmptyClientToken();
  const identityPayment = new IdentityPayment();
  const emptyCapture = new EmptyCaptureMoney();

  return {
    paymentStrategyFactory: new PaymentStrategyFactory(
      braintreeClientToken,
      braintreePayment,
      emptyClientToken,
      paypalCapture,
      identityPayment,
      emptyCapture,
      payPalPayment,
      repos.paymentMethod
    ),
    logger: new MockLogger(),
  };
}
export function buildMockRepos(): MockRepos {
  const articleRepo = new MockArticleRepo();
  const invoiceItemRepo = new MockInvoiceItemRepo();

  return {
    address: new MockAddressRepo(),
    catalog: new MockCatalogRepo(),
    invoice: new MockInvoiceRepo(),
    invoiceItem: invoiceItemRepo,
    transaction: new MockTransactionRepo(),
    payer: new MockPayerRepo(),
    payment: new MockPaymentRepo(),
    paymentMethod: new MockPaymentMethodRepo(),
    waiver: new MockWaiverRepo(),
    manuscript: articleRepo,
    editor: new MockEditorRepo(),
    coupon: new MockCouponRepo(),
    publisher: new MockPublisherRepo(),
  };
}

export function buildMockContext(): MockContext {
  const repos = buildMockRepos();
  return {
    repos,
    services: buildMockServices(repos),
  };
}
