import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { PublishMessage } from '../../../../domain/services/sqs/PublishMessage';

import { MockArticleRepo } from '../../../manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from '../../../addresses/repos/mocks/mockAddressRepo';
import { MockCouponRepo } from '../../../coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceItemRepo } from '../../repos/mocks/mockInvoiceItemRepo';
import { MockPayerRepo } from '../../../payers/repos/mocks/mockPayerRepo';
import { MockInvoiceRepo } from '../../repos/mocks/mockInvoiceRepo';

import { GenerateCompensatoryEventsErrors } from './generateCompensatoryEventsErrors';
import { GenerateCompensatoryEventsUsecase } from './generateCompensatoryEvents';
import { GenerateCompensatoryEventsDTO } from './generateCompensatoryEventsDTO';

import {
  STATUS as TransactionStatus,
  Transaction
} from '../../../transactions/domain/Transaction';
import { TransactionId } from '../../../transactions/domain/TransactionId';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceItem, InvoiceItemProps } from '../../domain/InvoiceItem';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { ManuscriptId } from '../../domain/ManuscriptId';
import { Article } from '../../../manuscripts/domain/Article';
import { ArticleId } from '../../../manuscripts/domain/ArticleId';
import { PaymentMethod } from '../../../payments/domain/PaymentMethod';

class MockSQSPublishService implements SQSPublishServiceContract {
  messages: PublishMessage[] = [];

  async publishMessage(message: PublishMessage): Promise<void> {
    this.messages.push(message);
  }
}

describe('migrate entire invoice usecase', () => {
  let compensatoryEventsUsecase: GenerateCompensatoryEventsUsecase;
  let sqsPublishService: MockSQSPublishService;
  let invoiceItemRepo: MockInvoiceItemRepo;
  let manuscriptRepo: MockArticleRepo;
  let addressRepo: MockAddressRepo;
  let invoiceRepo: MockInvoiceRepo;
  let couponRepo: MockCouponRepo;
  let waiverRepo: MockWaiverRepo;
  let payerRepo: MockPayerRepo;

  beforeEach(() => {
    sqsPublishService = new MockSQSPublishService();
    invoiceItemRepo = new MockInvoiceItemRepo();
    manuscriptRepo = new MockArticleRepo();
    addressRepo = new MockAddressRepo();
    invoiceRepo = new MockInvoiceRepo();
    couponRepo = new MockCouponRepo();
    waiverRepo = new MockWaiverRepo();
    payerRepo = new MockPayerRepo();

    addInvoiceItems(invoiceItemRepo);
    addManuscripts(manuscriptRepo);
    addInvoices(invoiceRepo);

    compensatoryEventsUsecase = new GenerateCompensatoryEventsUsecase(
      invoiceItemRepo,
      sqsPublishService,
      manuscriptRepo,
      addressRepo,
      invoiceRepo,
      couponRepo,
      waiverRepo,
      payerRepo
    );
  });

  it('should send 3 events if the invoice with provided id is final', async () => {
    const result = await compensatoryEventsUsecase.execute({ invoiceId: '1' });

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(3);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');

    expect(sqsPublishService.messages[1].event).toBe('InvoiceConfirmed');
    expect(sqsPublishService.messages[1].timestamp).toContain('2019-11-01');

    expect(sqsPublishService.messages[2].event).toBe('InvoicePaid');
    expect(sqsPublishService.messages[2].timestamp).toContain('2019-12-01');
  });

  it('should not send events if the invoice with provided id is draft and has no acceptance date', async () => {
    const result = await compensatoryEventsUsecase.execute({ invoiceId: '2' });

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(0);
  });

  it('should send 2 events if the invoice with provided id is active with issued date and acceptance date', async () => {
    const result = await compensatoryEventsUsecase.execute({ invoiceId: '3' });

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(2);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');

    expect(sqsPublishService.messages[1].event).toBe('InvoiceConfirmed');
    expect(sqsPublishService.messages[1].timestamp).toContain('2019-11-01');
  });

  it('should send 1 event if the invoice with provided id is pending', async () => {
    const result = await compensatoryEventsUsecase.execute({ invoiceId: '4' });

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(1);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');
  });

  it('should send 1 event if the invoice with provided id is draft with acceptance date', async () => {
    const result = await compensatoryEventsUsecase.execute({ invoiceId: '5' });

    expect(result.isRight()).toBeTruthy();

    expect(sqsPublishService.messages.length).toBe(1);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toContain('2019-10-13');
  });
});

function addInvoices(invoicesRepo: MockInvoiceRepo) {
  const invoicesProps = [
    {
      status: InvoiceStatus.FINAL,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 0,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateIssued: new Date('2019-11-01'),
      dateUpdated: new Date('2019-12-01'),
      id: '1'
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('2')),
      charge: 0,
      dateCreated: new Date('2018-12-15'),
      dateUpdated: new Date('2018-12-15'),
      id: '2'
    },
    {
      status: InvoiceStatus.ACTIVE,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 0,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateIssued: new Date('2019-11-01'),
      dateUpdated: new Date('2019-11-01'),
      id: '3'
    },
    {
      status: InvoiceStatus.PENDING,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 0,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateIssued: new Date('2019-11-01'),
      dateUpdated: new Date('2019-11-01'),
      id: '4'
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 0,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateUpdated: new Date('2019-10-13'),
      id: '5'
    }
  ];

  for (const props of invoicesProps) {
    const invoice = Invoice.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    invoicesRepo.addMockItem(invoice);
  }
}

function addInvoiceItems(invoiceItemRepo: MockInvoiceItemRepo) {
  interface InvoiceItemsPropsWithId extends InvoiceItemProps {
    id: string;
  }

  const invoiceItemsProps: InvoiceItemsPropsWithId[] = [
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('1')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('1')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '1'
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('2')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('2')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '2'
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('3')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('3')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '3'
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('4')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('4')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '4'
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('5')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('5')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '5'
    }
  ];

  for (const props of invoiceItemsProps) {
    const invoiceItem = InvoiceItem.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    invoiceItemRepo.addMockItem(invoiceItem);
  }
}

function addManuscripts(manuscriptRepo: MockArticleRepo) {
  const manuscriptsProps = [
    {
      journalId: '1',
      customId: '1',
      title: 'Test 1',
      articleType: '1',
      created: new Date(),
      id: '1'
    },
    {
      journalId: '2',
      customId: '2',
      title: 'Test 2',
      articleType: '2',
      created: new Date(),
      id: '2'
    },
    {
      journalId: '3',
      customId: '3',
      title: 'Test 3',
      articleType: '3',
      created: new Date(),
      id: '3'
    },
    {
      journalId: '4',
      customId: '4',
      title: 'Test 4',
      articleType: '4',
      created: new Date(),
      id: '4'
    },
    {
      journalId: '5',
      customId: '5',
      title: 'Test 5',
      articleType: '5',
      created: new Date(),
      id: '5'
    }
  ];

  for (const props of manuscriptsProps) {
    const manuscript = Article.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    manuscriptRepo.addMockItem(manuscript);
  }
}
