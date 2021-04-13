import { Before, After, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';

import {
  buildMockContext,
  MockContext,
} from '../../../../../../specs/utils/mockContextBuilder';

import { DomainEvents } from '../../../../../../src/lib/core/domain/events/DomainEvents';
import {
  UsecaseAuthorizationContext,
  Roles,
} from '../../../../../../src/lib/domain/authorization';

import {
  AfterPaymentCompleted,
  PaymentMethodMap,
  InvoiceItemMap,
  UniqueEntityID,
  ArticleMap,
  InvoiceMap,
  InvoiceId,
  PayerMap,
  PaymentMap,
} from '../../../../../../src';

import { RecordPaymentResponse } from '../../../../../../src/lib/modules/payments/usecases/recordPayment/recordPaymentResponse';
import { RecordPaymentUsecase } from '../../../../../../src/lib/modules/payments/usecases/recordPayment/recordPayment';
import { RecordPaymentDTO } from '../../../../../../src/lib/modules/payments/usecases/recordPayment/recordPaymentDTO';

const authContext: UsecaseAuthorizationContext = {
  roles: [Roles.PAYER],
};

let subscription: AfterPaymentCompleted;
let response: RecordPaymentResponse;
let usecase: RecordPaymentUsecase;
let request: RecordPaymentDTO;
let testPaymentId: string;
let context: MockContext;

const testManuscriptCustomId = '88888';
const testInvoiceId = 'test-invoice';
const testPayerId = 'test-payer';

Before(async function () {
  context = buildMockContext();
  const {
    repos: {
      payment: paymentRepo,
      invoice: invoiceRepo,
      invoiceItem: invoiceItemRepo,
      manuscript: manuscriptRepo,
      coupon: couponRepo,
      waiver: waiverRepo,
      payer: payerRepo,
    },
    services: { paymentStrategyFactory, logger },
  } = context;

  usecase = new RecordPaymentUsecase(
    paymentStrategyFactory,
    invoiceItemRepo,
    manuscriptRepo,
    paymentRepo,
    invoiceRepo,
    couponRepo,
    waiverRepo,
    payerRepo,
    logger
  );

  const invoice = InvoiceMap.toDomain({
    transactionId: 'transaction-id',
    dateCreated: new Date(),
    id: testInvoiceId,
    status: 'ACTIVE',
  });
  const invoiceItem = InvoiceItemMap.toDomain({
    invoiceId: testInvoiceId,
    manuscriptId: testManuscriptCustomId,
    price: 1000,
  });
  const article = ArticleMap.toDomain({
    id: testManuscriptCustomId,
    customId: testManuscriptCustomId,
  });
  const payer = PayerMap.toDomain({
    invoiceId: testInvoiceId,
    name: 'Belzebut',
    id: testPayerId,
  });
  await context.repos.invoice.save(invoice);
  await context.repos.invoiceItem.save(invoiceItem);
  await context.repos.payer.save(payer);
  await context.repos.manuscript.save(article);

  subscription = new AfterPaymentCompleted(
    context.repos.invoice,
    context.services.logger
  );
});

After(function () {
  DomainEvents.clearHandlers();
  DomainEvents.clearMarkedAggregates();
});

When(
  /^1 "([\w-]+)" Bank Transfer payment with the amount (\d+) is applied$/,
  async function (paymentType: string, amount: number) {
    let isFinalPayment = false;

    if (paymentType === 'final') {
      isFinalPayment = true;
    }

    testPaymentId = 'Bank Transfer';
    request = {
      invoiceId: testInvoiceId,
      amount,
      isFinalPayment,
      paymentReference: '123',
      datePaid: '2021-02-12',
    };

    await context.repos.paymentMethod.save(
      PaymentMethodMap.toDomain({
        id: testPaymentId,
        name: testPaymentId,
        isActive: true,
      })
    );
    response = await usecase.execute(request, authContext);
  }
);

When(/^1 PayPal payment is applied$/, async function () {
  testPaymentId = 'Paypal';
  request = {
    invoiceId: testInvoiceId,
    datePaid: '2021-02-12',
  };

  await context.repos.paymentMethod.save(
    PaymentMethodMap.toDomain({
      id: testPaymentId,
      name: testPaymentId,
      isActive: true,
    })
  );
  response = await usecase.execute(request, authContext);
});

When(/^1 Credit Card payment is applied$/, async function () {
  testPaymentId = 'Credit Card';
  request = {
    invoiceId: testInvoiceId,
    payerIdentification: 'test-credit-card',
    datePaid: '2021-02-12',
  };

  await context.repos.paymentMethod.save(
    PaymentMethodMap.toDomain({
      id: testPaymentId,
      name: testPaymentId,
      isActive: true,
    })
  );
  response = await usecase.execute(request, authContext);
});

Then(/^The payment amount is (\d+)$/, async (amount: number) => {
  expect(response.isRight()).to.eq(true);
  const payments = await context.repos.payment.getPaymentsByInvoiceId(
    InvoiceId.create(new UniqueEntityID(testInvoiceId)).getValue()
  );
  const expectedAmount = payments.reduce((acc, p) => acc + p.amount.value, 0);
  expect(expectedAmount).to.equal(amount);
});

Then(/^The payments are of type "Bank Transfer"$/, async () => {
  expect(response.isRight()).to.eq(true);
  const payments = await context.repos.payment.getPaymentsByInvoiceId(
    InvoiceId.create(new UniqueEntityID(testInvoiceId)).getValue()
  );
  const paymentMethod = await context.repos.paymentMethod.getPaymentMethodByName(
    'Bank Transfer'
  );
  for (const payment of payments) {
    expect(payment.paymentMethodId.toString()).to.equal(
      paymentMethod.id.toString()
    );
  }
});

Then(/^The paid invoice has the status "([\w-]+)"$/, async (status: string) => {
  expect(response.isRight()).to.eq(true);
  const invoice = await context.repos.invoice.getInvoiceById(
    InvoiceId.create(new UniqueEntityID(testInvoiceId)).getValue()
  );
  expect(invoice.status).to.equal(status);
});

Then(/^The payment is in status "([\w-]+)"$/, async (status: string) => {
  expect(response.isRight()).to.eq(true);
  if (response.isRight()) {
    expect(response.value.status).to.equal(status);
  }
});

Given(
  /^There is a PayPal payment with the amount (\d+) with status "([\w-]+)" and order id "([\w-]+)"$/,
  async (amount: number, status: string, orderId: string) => {
    const payment = PaymentMap.toDomain({
      payerId: testPayerId,
      invoiceId: testInvoiceId,
      amount: amount,
      paymentMethodId: 'Paypal',
      foreignPaymentId: orderId,
      datePaid: '2021-02-01',
      status: status,
    });

    await context.repos.payment.save(payment);
  }
);

Then(
  /^There is only one payment with the payment proof not equal to "([\w-]+)"$/,
  async (orderId) => {
    const payments = await context.repos.payment.getPaymentsByInvoiceId(
      InvoiceId.create(new UniqueEntityID(testInvoiceId)).getValue()
    );

    expect(payments.length).to.equal(1);
    expect(payments[0].foreignPaymentId).to.not.equal(orderId);
  }
);

Then(/^The payment recording fails$/, () => {
  expect(response.isLeft()).to.equal(true);
});
