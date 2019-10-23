import {defineFeature, loadFeature} from 'jest-cucumber';

import {Result} from '../../../src/lib/core/logic/Result';
import {Roles} from '../../../src/lib/modules/users/domain/enums/Roles';

import {InvoiceStatus} from '../../../src/lib/modules/invoices/domain/Invoice';
import {InvoiceId} from './../../../src/lib/modules/invoices/domain/InvoiceId';
import {
  CreateTransactionContext,
  CreateTransactionUsecase
} from '../../../src/lib/modules/transactions/usecases/createTransaction/createTransaction';

import {
  Transaction,
  STATUS as TransactionStatus
} from '../../../src/lib/modules/transactions/domain/Transaction';
import {TransactionId} from './../../../src/lib/modules/transactions/domain/TransactionId';
import {MockTransactionRepo} from '../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

import {MockInvoiceRepo} from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import {MockArticleRepo} from './../../../src/lib/modules/articles/repos/mocks/mockArticleRepo';
import {MockInvoiceItemRepo} from './../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';

const feature = loadFeature(
  '../../features/reviewEvents/on-manuscript-submit.feature',
  {loadRelativePath: true}
);

const defaultContext: CreateTransactionContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  const mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();
  const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
  const mockArticleRepo: MockArticleRepo = new MockArticleRepo();
  const mockInvoiceItemRepo: MockInvoiceItemRepo = new MockInvoiceItemRepo();
  let result: Result<Transaction>;

  const manuscriptId = 'manuscript-id';
  let transactionId: TransactionId;
  let invoiceId: InvoiceId;

  const usecase: CreateTransactionUsecase = new CreateTransactionUsecase(
    mockTransactionRepo,
    mockArticleRepo,
    mockInvoiceRepo,
    mockInvoiceItemRepo
  );

  // beforeEach(() => {
  //   const transaction = TransactionMap.toDomain({
  //     status: TransactionStatus.DRAFT
  //   });
  //   mockTransactionRepo.save(transaction);
  //   const invoice = InvoiceMap.toDomain({
  //     status: InvoiceStatus.DRAFT,
  //     invoiceId: transaction.transactionId
  //   });
  //   mockInvoiceRepo.save(invoice);
  // });

  test('Manuscript Submit Handler', ({given, when, then, and}) => {
    given('Invoicing listening to events emitted by Review', () => {});

    when('A manuscript submit event is published', async () => {
      result = await usecase.execute(
        {
          manuscriptId
        },
        defaultContext
      );
    });

    then('A DRAFT Transaction should be created', async () => {
      expect(result.isSuccess).toBe(true);

      const lastSavedTransactions = await mockTransactionRepo.getTransactionCollection();

      expect(lastSavedTransactions.length).toEqual(1);
      expect(lastSavedTransactions[0].status).toEqual(TransactionStatus.DRAFT);
      transactionId = lastSavedTransactions[0].transactionId;
    });

    and('A DRAFT Invoice should be created', async () => {
      const lastSavedInvoices = await mockInvoiceRepo.getInvoiceCollection();

      expect(lastSavedInvoices.length).toEqual(1);
      expect(lastSavedInvoices[0].status).toEqual(InvoiceStatus.DRAFT);
      expect(lastSavedInvoices[0].transactionId.id.toString()).toEqual(
        transactionId.id.toString()
      );
      invoiceId = lastSavedInvoices[0].invoiceId;
    });

    and('An Invoice Item should be created', async () => {
      const lastSavedInvoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();

      expect(lastSavedInvoiceItems.length).toEqual(1);
      expect(lastSavedInvoiceItems[0].invoiceId.id.toString()).toEqual(
        invoiceId.id.toString()
      );
    });
  });
});
