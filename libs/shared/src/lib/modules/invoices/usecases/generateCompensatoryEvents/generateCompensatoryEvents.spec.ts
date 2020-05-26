import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { LoggerContract, MockLogger } from '../../../../infrastructure/logging';
import { PublishMessage } from '../../../../domain/services/sqs/PublishMessage';

import { MockPaymentMethodRepo } from '../../../payments/repos/mocks/mockPaymentMethodRepo';
import { MockArticleRepo } from '../../../manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from '../../../addresses/repos/mocks/mockAddressRepo';
import { MockPaymentRepo } from '../../../payments/repos/mocks/mockPaymentRepo';
import { MockCouponRepo } from '../../../coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceItemRepo } from '../../repos/mocks/mockInvoiceItemRepo';
import { MockPayerRepo } from '../../../payers/repos/mocks/mockPayerRepo';
import { MockInvoiceRepo } from '../../repos/mocks/mockInvoiceRepo';

import {
  GenerateCompensatoryEventsContext,
  GenerateCompensatoryEventsUsecase,
} from './generateCompensatoryEvents';

import {
  addBillingAddresses,
  addPaymentMethods,
  addInvoiceItems,
  addManuscripts,
  addInvoices,
  addPayments,
  addCoupons,
  addWaivers,
  addPayers,
} from './testUtils';
import { Roles } from '../../../users/domain/enums/Roles';

class MockSQSPublishService implements SQSPublishServiceContract {
  messages: PublishMessage[] = [];

  async publishMessage(message: PublishMessage): Promise<void> {
    this.messages.push(message);
  }
}

describe('migrate entire invoice usecase', () => {
  let compensatoryEventsUsecase: GenerateCompensatoryEventsUsecase;
  let context: GenerateCompensatoryEventsContext;
  let paymentMethodRepo: MockPaymentMethodRepo;
  let sqsPublishService: MockSQSPublishService;
  let invoiceItemRepo: MockInvoiceItemRepo;
  let manuscriptRepo: MockArticleRepo;
  let addressRepo: MockAddressRepo;
  let invoiceRepo: MockInvoiceRepo;
  let paymentRepo: MockPaymentRepo;
  let couponRepo: MockCouponRepo;
  let waiverRepo: MockWaiverRepo;
  let payerRepo: MockPayerRepo;
  let loggerService: LoggerContract;

  beforeEach(() => {
    sqsPublishService = new MockSQSPublishService();
    paymentMethodRepo = new MockPaymentMethodRepo();
    invoiceItemRepo = new MockInvoiceItemRepo();
    manuscriptRepo = new MockArticleRepo();
    addressRepo = new MockAddressRepo();
    invoiceRepo = new MockInvoiceRepo();
    paymentRepo = new MockPaymentRepo();
    couponRepo = new MockCouponRepo();
    waiverRepo = new MockWaiverRepo();
    payerRepo = new MockPayerRepo();

    context = {
      roles: [Roles.ADMIN],
    };
    loggerService = new MockLogger();

    addPaymentMethods(paymentMethodRepo);
    addBillingAddresses(addressRepo);
    addInvoiceItems(invoiceItemRepo);
    addManuscripts(manuscriptRepo);
    addInvoices(invoiceRepo);
    addPayments(paymentRepo);
    addCoupons(couponRepo);
    addWaivers(waiverRepo);
    addPayers(payerRepo);

    compensatoryEventsUsecase = new GenerateCompensatoryEventsUsecase(
      paymentMethodRepo,
      invoiceItemRepo,
      sqsPublishService,
      manuscriptRepo,
      addressRepo,
      invoiceRepo,
      paymentRepo,
      couponRepo,
      waiverRepo,
      payerRepo,
      loggerService
    );
  });

  it('should send 3 events if the invoice with provided id is final', async () => {
    const result = await compensatoryEventsUsecase.execute(
      { invoiceId: '1' },
      context
    );

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(4);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');
    expect(
      sqsPublishService.messages[0].data.invoiceItems[0].coupons.length
    ).toBe(0);

    expect(sqsPublishService.messages[1].event).toBe('InvoiceConfirmed');
    expect(sqsPublishService.messages[1].timestamp).toContain('2019-11-01');
    expect(
      sqsPublishService.messages[1].data.invoiceItems[0].coupons.length
    ).toBe(1);

    expect(sqsPublishService.messages[2].event).toBe('InvoicePaid');
    expect(sqsPublishService.messages[2].timestamp).toContain('2019-12-01');
    expect(
      sqsPublishService.messages[2].data.invoiceItems[0].coupons.length
    ).toBe(1);

    expect(sqsPublishService.messages[3].event).toBe('InvoiceFinalized');
    expect(sqsPublishService.messages[3].timestamp).toContain('2019-12-03');
    expect(
      sqsPublishService.messages[3].data.invoiceItems[0].coupons.length
    ).toBe(1);
  });

  it('should not send events if the invoice with provided id is draft and has no acceptance date', async () => {
    const result = await compensatoryEventsUsecase.execute(
      { invoiceId: '2' },
      context
    );

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(0);
  });

  it('should send 2 events if the invoice with provided id is active with issued date and acceptance date', async () => {
    const result = await compensatoryEventsUsecase.execute(
      { invoiceId: '3' },
      context
    );

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(2);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');

    expect(sqsPublishService.messages[1].event).toBe('InvoiceConfirmed');
    expect(sqsPublishService.messages[1].timestamp).toContain('2019-11-01');
  });

  it('should send 1 event if the invoice with provided id is pending', async () => {
    const result = await compensatoryEventsUsecase.execute(
      { invoiceId: '4' },
      context
    );

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(1);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');
  });

  it('should send 1 event if the invoice with provided id is draft with acceptance date', async () => {
    const result = await compensatoryEventsUsecase.execute(
      { invoiceId: '5' },
      context
    );

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(1);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');
  });

  it('should send 2 events if the invoice provided is a credit note', async () => {
    const result = await compensatoryEventsUsecase.execute(
      { invoiceId: '7' },
      context
    );

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(2);

    expect(sqsPublishService.messages[0].event).toBe(
      'InvoiceCreditNoteCreated'
    );

    expect(sqsPublishService.messages[1].event).toBe('InvoiceFinalized');
  });
});
