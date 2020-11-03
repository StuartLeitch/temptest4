import { expect } from 'chai';

import {
  buildMockContext,
  MockContext,
} from '../../../../../../specs/utils/mockContextBuilder';
import { Given, When, Then, Before } from 'cucumber';
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
} from '../../../../../../src';

let usecase: RecordPaymentUsecase;
let context: MockContext;
let response: RecordPaymentResponse;
let request: RecordPaymentDTO;
const authContext: UsecaseAuthorizationContext = {
  roles: [Roles.PAYER],
};

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
  });
  const invoiceItem = InvoiceItemMap.toDomain({
    invoiceId: testInvoiceId,
    manuscriptId: testManuscriptCustomId,
    price: 1000,
  });
  const article = ArticleMap.toDomain({
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
});

Given(
  /^1 non-final Bank Transfer payment with the amount (\d+) is applied$/,
  async function (amount: number) {
    testPaymentId = 'Bank Transfer';
    request = {
      invoiceId: testInvoiceId,
      amount,
      isFinalPayment: false,
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
  expect(
    (
      await context.repos.payment.getPaymentByInvoiceId(
        InvoiceId.create(new UniqueEntityID(testInvoiceId)).getValue()
      )
    ).amount
  ).to.equal(amount);
});
