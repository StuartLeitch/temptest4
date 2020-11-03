import { expect } from 'chai';

import {
  buildMockContext,
  MockContext,
} from '../../../../../../specs/utils/mockContextBuilder';
import { Given, When, Then, Before, After } from 'cucumber';
import { RecordPaymentUsecase } from '../../../../../../src/lib/modules/payments/usecases/recordPayment/recordPayment';
import { RecordPaymentResponse } from '../../../../../../src/lib/modules/payments/usecases/recordPayment/recordPaymentResponse';
import { RecordPaymentDTO } from '../../../../../../src/lib/modules/payments/usecases/recordPayment/recordPaymentDTO';
import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/domain/authorization';
import {
  InvoiceMap,
  InvoiceItemMap,
  Payment,
  InvoiceId,
  UniqueEntityID,
  PayerMap,
  PaymentMethodMap,
  ArticleMap,
  AfterPaymentCompleted,
} from '../../../../../../src';
import { NoOpUseCase } from '../../../../../../src/lib/core/domain/NoOpUseCase';
import { DomainEvents } from '../../../../../../src/lib/core/domain/events/DomainEvents';

let usecase: RecordPaymentUsecase;
let context: MockContext;
let response: RecordPaymentResponse;
let request: RecordPaymentDTO;
const authContext: UsecaseAuthorizationContext = {
  roles: [Roles.PAYER],
};
let subscription: AfterPaymentCompleted;
const testInvoiceId = 'test-invoice';
const testManuscriptCustomId = '88888';
let testPaymentId;

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
  });
  await context.repos.invoice.save(invoice);
  await context.repos.invoiceItem.save(invoiceItem);
  await context.repos.payer.save(payer);
  await context.repos.manuscript.save(article);
  const publishPaymentToErp = new NoOpUseCase();

  subscription = new AfterPaymentCompleted(
    context.repos.invoice,
    context.services.logger,
    publishPaymentToErp
  );
});

After(function () {
  DomainEvents.clearHandlers();
  DomainEvents.clearMarkedAggregates();
});

Given(
  /^1 "([\w-]+)" Bank Transfer payment with the amount (\d+) is applied$/,
  async function (paymentType: string, amount: number) {
    let isFinalPayment = false;

    if (paymentType === 'final') {
      console.log('setting final');
      isFinalPayment = true;
    }

    testPaymentId = 'Bank Transfer';
    request = {
      invoiceId: testInvoiceId,
      amount,
      isFinalPayment,
      paymentReference: '123',
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
  for (let payment of payments) {
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
