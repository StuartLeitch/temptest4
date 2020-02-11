import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { PublishMessage } from '../../../../domain/services/sqs/PublishMessage';

import { MockPaymentMethodRepo } from '../../../payments/repos/mocks/mockPaymentMethodRepo';
import { MockTransactionRepo } from '../../../transactions/repos/mocks/mockTransactionRepo';
import { MockArticleRepo } from '../../../manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from '../../../addresses/repos/mocks/mockAddressRepo';
import { MockPaymentRepo } from '../../../payments/repos/mocks/mockPaymentRepo';
import { MockCouponRepo } from '../../../coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceItemRepo } from '../../repos/mocks/mockInvoiceItemRepo';
import { MockPayerRepo } from '../../../payers/repos/mocks/mockPayerRepo';
import { MockInvoiceRepo } from '../../repos/mocks/mockInvoiceRepo';

import { MigrateEntireInvoiceErrors } from './migrateEntireInvoiceErrors';
import { MigrateEntireInvoiceUsecase } from './migrateEntireInvoice';
import { MigrateEntireInvoiceDTO } from './migrateEntireInvoiceDTO';

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
  let migrateUsecase: MigrateEntireInvoiceUsecase;
  let paymentMethodRepo: MockPaymentMethodRepo;
  let sqsPublishService: MockSQSPublishService;
  let invoiceItemRepo: MockInvoiceItemRepo;
  let transactionRepo: MockTransactionRepo;
  let manuscriptRepo: MockArticleRepo;
  let addressRepo: MockAddressRepo;
  let invoiceRepo: MockInvoiceRepo;
  let paymentRepo: MockPaymentRepo;
  let couponRepo: MockCouponRepo;
  let waiverRepo: MockWaiverRepo;
  let payerRepo: MockPayerRepo;

  beforeEach(() => {
    paymentMethodRepo = new MockPaymentMethodRepo();
    sqsPublishService = new MockSQSPublishService();
    invoiceItemRepo = new MockInvoiceItemRepo();
    transactionRepo = new MockTransactionRepo();
    manuscriptRepo = new MockArticleRepo();
    addressRepo = new MockAddressRepo();
    invoiceRepo = new MockInvoiceRepo();
    paymentRepo = new MockPaymentRepo();
    couponRepo = new MockCouponRepo();
    waiverRepo = new MockWaiverRepo();
    payerRepo = new MockPayerRepo();

    addPaymentMethods(paymentMethodRepo);
    addInvoiceItems(invoiceItemRepo);
    addTransactions(transactionRepo);
    addManuscripts(manuscriptRepo);
    addInvoices(invoiceRepo);

    migrateUsecase = new MigrateEntireInvoiceUsecase(
      paymentMethodRepo,
      sqsPublishService,
      invoiceItemRepo,
      transactionRepo,
      manuscriptRepo,
      addressRepo,
      invoiceRepo,
      paymentRepo,
      couponRepo,
      waiverRepo,
      payerRepo
    );
  });

  it('should publish the 3 invoices events when all data is passed', async () => {
    const request: MigrateEntireInvoiceDTO = {
      invoiceId: '1',
      acceptanceDate: new Date('03-08-2019').toISOString(),
      submissionDate: new Date('12-12-2018').toISOString(),
      paymentDate: new Date('07-08-2019').toISOString(),
      issueDate: new Date('06-08-2019').toISOString(),
      erpReference: '1234',
      apc: {
        invoiceReference: '00001/2019',
        paymentAmount: 220,
        manuscriptId: '1',
        discount: 20,
        price: 220,
        vat: 20
      },
      payer: {
        email: 'rares.stan@hindawi.com',
        vatRegistrationNumber: null,
        name: 'Rares Stan',
        type: 'INDIVIDUAL',
        address: {
          addressLine1: 'Str. Mihai Eminescu Nr. 3B',
          countryCode: 'RO',
          addressLine2: null,
          city: 'Iasi',
          state: null
        }
      }
    };

    const result = await migrateUsecase.execute(request);
    expect(result.isRight()).toBeTruthy();
    expect(sqsPublishService.messages.length).toBe(3);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toBe(
      request.acceptanceDate
    );
    expect(sqsPublishService.messages[0].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[0].data.referenceNumber).toBeFalsy();
    expect(sqsPublishService.messages[0].data.invoiceStatus).toBe('DRAFT');

    expect(sqsPublishService.messages[1].event).toBe('InvoiceConfirmed');
    expect(sqsPublishService.messages[1].timestamp).toBe(request.issueDate);
    expect(sqsPublishService.messages[1].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[1].data.referenceNumber).toBe(
      request.apc.invoiceReference
    );
    expect(sqsPublishService.messages[1].data.invoiceStatus).toBe('ACTIVE');

    expect(sqsPublishService.messages[2].event).toBe('InvoicePaid');
    expect(sqsPublishService.messages[2].timestamp).toBe(request.paymentDate);
    expect(sqsPublishService.messages[2].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[2].data.referenceNumber).toBe(
      request.apc.invoiceReference
    );
    expect(sqsPublishService.messages[2].data.invoiceStatus).toBe('FINAL');

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();
    const invoice = await invoiceRepo.getInvoiceById(invoiceId);
    const transaction = await transactionRepo.getTransactionById(
      invoice.transactionId
    );

    expect(transaction.status).toBe(TransactionStatus.ACTIVE);
    expect(invoice.status).toBe('FINAL');

    expect(transaction.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(transaction.dateUpdated.toISOString()).toBe(request.acceptanceDate);

    expect(invoice.dateIssued.toISOString()).toBe(request.issueDate);
    expect(invoice.referenceNumber).toBe(request.apc.invoiceReference);
    expect(invoice.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(invoice.props.dateUpdated.toISOString()).toBe(request.paymentDate);
    expect(invoice.dateAccepted.toISOString()).toBe(request.acceptanceDate);
    expect(invoice.payerId).toBeTruthy();

    const payer = await payerRepo.getPayerById(invoice.payerId);

    expect(payer).toBeTruthy();
    expect(payer.name.value).toBe(request.payer.name);
    expect(payer.type).toBe(request.payer.type);
  });

  it('should publish the 3 invoices events when all data is passed and payer is null and payment is 0', async () => {
    const request: MigrateEntireInvoiceDTO = {
      invoiceId: '1',
      acceptanceDate: new Date('03-08-2019').toISOString(),
      submissionDate: new Date('12-12-2018').toISOString(),
      paymentDate: new Date('07-08-2019').toISOString(),
      issueDate: new Date('06-08-2019').toISOString(),
      erpReference: '1234',
      apc: {
        invoiceReference: '00001/2019',
        paymentAmount: 0,
        manuscriptId: '1',
        discount: 200,
        price: 200,
        vat: 0
      },
      payer: null
    };

    const result = await migrateUsecase.execute(request);
    console.info(result.value);
    expect(result.isRight()).toBeTruthy();
    expect(sqsPublishService.messages.length).toBe(3);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toBe(
      request.acceptanceDate
    );
    expect(sqsPublishService.messages[0].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[0].data.referenceNumber).toBeFalsy();
    expect(sqsPublishService.messages[0].data.invoiceStatus).toBe('DRAFT');

    expect(sqsPublishService.messages[1].event).toBe('InvoiceConfirmed');
    expect(sqsPublishService.messages[1].timestamp).toBe(request.issueDate);
    expect(sqsPublishService.messages[1].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[1].data.referenceNumber).toBe(
      request.apc.invoiceReference
    );
    expect(sqsPublishService.messages[1].data.invoiceStatus).toBe('ACTIVE');

    expect(sqsPublishService.messages[2].event).toBe('InvoicePaid');
    expect(sqsPublishService.messages[2].timestamp).toBe(request.paymentDate);
    expect(sqsPublishService.messages[2].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[2].data.referenceNumber).toBe(
      request.apc.invoiceReference
    );
    expect(sqsPublishService.messages[2].data.invoiceStatus).toBe('FINAL');

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();
    const invoice = await invoiceRepo.getInvoiceById(invoiceId);
    const transaction = await transactionRepo.getTransactionById(
      invoice.transactionId
    );

    expect(transaction.status).toBe(TransactionStatus.ACTIVE);
    expect(invoice.status).toBe('FINAL');

    expect(transaction.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(transaction.dateUpdated.toISOString()).toBe(request.acceptanceDate);

    expect(invoice.dateIssued.toISOString()).toBe(request.issueDate);
    expect(invoice.referenceNumber).toBe(request.apc.invoiceReference);
    expect(invoice.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(invoice.props.dateUpdated.toISOString()).toBe(request.paymentDate);
    expect(invoice.dateAccepted.toISOString()).toBe(request.acceptanceDate);
  });

  it('should publish the first 2 invoices events when acceptance date, payer and issue date is provided', async () => {
    const request: MigrateEntireInvoiceDTO = {
      invoiceId: '1',
      acceptanceDate: new Date('03-08-2019').toISOString(),
      submissionDate: new Date('12-12-2018').toISOString(),
      paymentDate: null,
      issueDate: new Date('06-08-2019').toISOString(),
      erpReference: '1234',
      apc: {
        invoiceReference: '00001/2019',
        paymentAmount: null,
        manuscriptId: '1',
        discount: 20,
        price: 220,
        vat: 20
      },
      payer: {
        email: 'rares.stan@hindawi.com',
        vatRegistrationNumber: null,
        name: 'Rares Stan',
        type: 'INDIVIDUAL',
        address: {
          addressLine1: 'Str. Mihai Eminescu Nr. 3B',
          countryCode: 'RO',
          addressLine2: null,
          city: 'Iasi',
          state: null
        }
      }
    };

    const result = await migrateUsecase.execute(request);
    expect(result.isRight()).toBeTruthy();
    expect(sqsPublishService.messages.length).toBe(2);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toBe(
      request.acceptanceDate
    );
    expect(sqsPublishService.messages[0].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[0].data.referenceNumber).toBeFalsy();
    expect(sqsPublishService.messages[0].data.invoiceStatus).toBe('DRAFT');

    expect(sqsPublishService.messages[1].event).toBe('InvoiceConfirmed');
    expect(sqsPublishService.messages[1].timestamp).toBe(request.issueDate);
    expect(sqsPublishService.messages[1].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[1].data.referenceNumber).toBe(
      request.apc.invoiceReference
    );
    expect(sqsPublishService.messages[1].data.invoiceStatus).toBe('ACTIVE');

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();
    const invoice = await invoiceRepo.getInvoiceById(invoiceId);
    const transaction = await transactionRepo.getTransactionById(
      invoice.transactionId
    );

    expect(transaction.status).toBe(TransactionStatus.ACTIVE);
    expect(invoice.status).toBe('ACTIVE');

    expect(transaction.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(transaction.dateUpdated.toISOString()).toBe(request.acceptanceDate);

    expect(invoice.dateIssued.toISOString()).toBe(request.issueDate);
    expect(invoice.referenceNumber).toBe(request.apc.invoiceReference);
    expect(invoice.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(invoice.props.dateUpdated.toISOString()).toBe(request.issueDate);
    expect(invoice.dateAccepted.toISOString()).toBe(request.acceptanceDate);
    expect(invoice.payerId).toBeTruthy();

    const payer = await payerRepo.getPayerById(invoice.payerId);

    expect(payer).toBeTruthy();
    expect(payer.name.value).toBe(request.payer.name);
    expect(payer.type).toBe(request.payer.type);
  });

  it('should publish only the InvoiceCreated event when only the acceptanceDate is provided', async () => {
    const request: MigrateEntireInvoiceDTO = {
      invoiceId: '1',
      acceptanceDate: new Date('03-08-2019').toISOString(),
      submissionDate: new Date('12-12-2018').toISOString(),
      paymentDate: null,
      issueDate: null,
      erpReference: null,
      apc: {
        invoiceReference: null,
        paymentAmount: 220,
        manuscriptId: '1',
        discount: 20,
        price: 220,
        vat: 20
      },
      payer: null
    };

    const result = await migrateUsecase.execute(request);
    expect(result.isRight()).toBeTruthy();
    expect(sqsPublishService.messages.length).toBe(1);
    expect(sqsPublishService.messages[0].event).toBe('InvoiceCreated');
    expect(sqsPublishService.messages[0].timestamp).toBe(
      request.acceptanceDate
    );
    expect(sqsPublishService.messages[0].data.invoiceId).toBe(
      request.invoiceId
    );
    expect(sqsPublishService.messages[0].data.referenceNumber).toBeFalsy();
    expect(sqsPublishService.messages[0].data.invoiceStatus).toBe('DRAFT');

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();
    const invoice = await invoiceRepo.getInvoiceById(invoiceId);
    const transaction = await transactionRepo.getTransactionById(
      invoice.transactionId
    );

    expect(transaction.status).toBe(TransactionStatus.ACTIVE);
    expect(transaction.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(transaction.dateUpdated.toISOString()).toBe(request.acceptanceDate);

    expect(invoice.status).toBe('DRAFT');
    expect(invoice.dateIssued).toBeFalsy();
    expect(invoice.invoiceNumber).toBeFalsy();
    expect(invoice.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(invoice.props.dateUpdated.toISOString()).toBe(
      request.acceptanceDate
    );
    expect(invoice.payerId).toBeFalsy();
  });

  it('should not send any events if the acceptance date is not provided', async () => {
    const request: MigrateEntireInvoiceDTO = {
      invoiceId: '1',
      acceptanceDate: null,
      submissionDate: new Date('12-12-2018').toISOString(),
      paymentDate: null,
      issueDate: null,
      erpReference: null,
      apc: {
        invoiceReference: null,
        paymentAmount: 220,
        manuscriptId: '1',
        discount: 20,
        price: 220,
        vat: 20
      },
      payer: null
    };

    const result = await migrateUsecase.execute(request);
    expect(result.isRight()).toBeTruthy();
    expect(sqsPublishService.messages.length).toBe(0);

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();
    const invoice = await invoiceRepo.getInvoiceById(invoiceId);
    const transaction = await transactionRepo.getTransactionById(
      invoice.transactionId
    );

    expect(transaction.status).toBe(TransactionStatus.DRAFT);
    expect(transaction.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(transaction.dateUpdated.toISOString()).toBe(request.submissionDate);

    expect(invoice.status).toBe('DRAFT');
    expect(invoice.dateIssued).toBeFalsy();
    expect(invoice.invoiceNumber).toBeFalsy();
    expect(invoice.dateAccepted).toBeFalsy();
    expect(invoice.dateCreated.toISOString()).toBe(request.submissionDate);
    expect(invoice.props.dateUpdated.toISOString()).toBe(
      request.submissionDate
    );
  });
});

function addTransactions(transactionRepo: MockTransactionRepo) {
  const transactionsProps = [
    {
      status: TransactionStatus.DRAFT,
      id: '1'
    },
    {
      status: TransactionStatus.DRAFT,
      id: '2'
    },
    {
      status: TransactionStatus.DRAFT,
      id: '3'
    }
  ];

  for (const props of transactionsProps) {
    const transaction = Transaction.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    transactionRepo.addMockItem(transaction);
  }
}

function addInvoices(invoicesRepo: MockInvoiceRepo) {
  const invoicesProps = [
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 0,
      id: '1'
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('2')),
      charge: 0,
      id: '2'
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('3')),
      charge: 0,
      id: '3'
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('3')),
      charge: 0,
      id: '4'
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

function addPaymentMethods(paymentMethodRepo: MockPaymentMethodRepo) {
  const paymentMethodsProps = [
    {
      name: 'Migration',
      isActive: true
    }
  ];

  for (const props of paymentMethodsProps) {
    const paymentMethod = PaymentMethod.create(props).getValue();
    paymentMethodRepo.addMockItem(paymentMethod);
  }
}
