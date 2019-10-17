import {defineFeature, loadFeature} from 'jest-cucumber';

import {Result} from '../../../src/lib/core/logic/Result';
import {Roles} from '../../../src/lib/modules/users/domain/enums/Roles';

import {Invoice} from '../../../src/lib/modules/invoices/domain/Invoice';
import {InvoiceItem} from '../../../src/lib/modules/invoices/domain/InvoiceItem';
import {InvoiceStatus} from '../../../src/lib/modules/invoices/domain/Invoice';
import {InvoiceId} from '../../../src/lib/modules/invoices/domain/InvoiceId';
import {InvoiceMap} from './../../../src/lib/modules/invoices/mappers/InvoiceMap';
import {InvoiceItemMap} from './../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import {
  DeleteTransactionContext,
  SoftDeleteDraftTransactionUsecase
} from '../../../src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';

import {
  Transaction,
  STATUS as TransactionStatus
} from '../../../src/lib/modules/transactions/domain/Transaction';
import {TransactionId} from '../../../src/lib/modules/transactions/domain/TransactionId';
import {TransactionMap} from './../../../src/lib/modules/transactions/mappers/TransactionMap';
import {MockTransactionRepo} from '../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

import {MockInvoiceRepo} from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import {MockInvoiceItemRepo} from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';

const feature = loadFeature(
  '../../features/reviewEvents/on-manuscript-reject.feature',
  {loadRelativePath: true}
);

const defaultContext: DeleteTransactionContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  let mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();
  let mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
  let mockInvoiceItemRepo: MockInvoiceItemRepo = new MockInvoiceItemRepo();
  let result: Result<Transaction>;

  let manuscriptId = 'manuscript-id';
  let transactionId: TransactionId;
  let invoiceId: InvoiceId;

  let usecase: SoftDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
    mockTransactionRepo,
    mockInvoiceItemRepo,
    mockInvoiceRepo
  );

  let transaction: Transaction;
  let invoice: Invoice;
  let invoiceItem: InvoiceItem;

  beforeEach(() => {
    transaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT
    });
    invoice = InvoiceMap.toDomain({
      status: InvoiceStatus.DRAFT,
      transactionId: transaction.transactionId
    });
    invoiceItem = InvoiceItemMap.toDomain({
      manuscriptId,
      invoiceId: invoice.invoiceId.id.toString()
    });

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);

    mockTransactionRepo.save(transaction);
    mockInvoiceRepo.save(invoice);
    mockInvoiceItemRepo.save(invoiceItem);
  });

  test('Manuscript Reject Handler', ({given, when, then, and}) => {
    given('Invoicing listening to events emitted by Review', () => {});

    when('A manuscript reject event is published', async () => {
      result = await usecase.execute(
        {
          manuscriptId
        },
        defaultContext
      );
    });

    then(
      'The DRAFT Transaction associated with the manuscript should be soft deleted',
      async () => {
        expect(result.isSuccess).toBe(true);

        const transactions = await mockTransactionRepo.getTransactionCollection();
        expect(transactions.length).toEqual(0);
      }
    );

    and(
      'The DRAFT Invoice associated with the manuscript should be soft deleted',
      async () => {
        const invoices = await mockInvoiceRepo.getInvoiceCollection();
        expect(invoices.length).toEqual(0);
      }
    );

    and(
      'The Invoice Item associated with the manuscript should be soft deleted',
      async () => {
        const invoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
        expect(invoiceItems.length).toEqual(0);
      }
    );
  });
});
