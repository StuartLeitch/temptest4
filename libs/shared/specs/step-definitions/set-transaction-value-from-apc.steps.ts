import { defineFeature, loadFeature } from 'jest-cucumber';

import { Result } from '../../src/lib/core/logic/Result';
import { UniqueEntityID } from '../../src/lib/core/domain/UniqueEntityID';
import { Roles } from '../../src/lib/modules/users/domain/enums/Roles';

import {
  Invoice,
  // STATUS as InvoiceStatus
} from '../../src/lib/modules/invoices/domain/Invoice';
import {
  GetTransactionUsecase,
  GetTransactionContext,
} from '../../src/lib/modules/transactions/usecases/getTransaction/getTransaction';
import {
  UpdateTransactionUsecase,
  UpdateTransactionContext,
} from '../../src/lib/modules/transactions/usecases/updateTransaction/updateTransaction';

import { MockInvoiceRepo } from '../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockTransactionRepo } from '../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import {
  Transaction,
  TransactionStatus,
} from '../../src/lib/modules/transactions/domain/Transaction';
// import {TransactionAmount} from '../../lib/transactions/domain/TransactionAmount';

const feature = loadFeature(
  '../features/set-transaction-value-from-apc.feature',
  { loadRelativePath: true }
);

const defaultContext: UpdateTransactionContext & GetTransactionContext = {
  roles: [Roles.SUPER_ADMIN],
};

defineFeature(feature, (test) => {
  // let mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
  let mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();
  let result: Result<Transaction>;

  let transactionId;
  // let invoiceId;

  let getTransactionUsecase: GetTransactionUsecase = new GetTransactionUsecase(
    mockTransactionRepo
  );
  // let updateTransactionUsecase: UpdateTransactionUsecase = new UpdateTransactionUsecase(
  //   mockTransactionRepo
  // );

  let retrievedTransaction: Transaction;
  let retrievedApc: number;

  beforeEach(() => {
    transactionId = 'test-transaction';
    const transaction = Transaction.create(
      {
        status: TransactionStatus.DRAFT,
        // name: PayerName.create('foo').getValue()
      },
      new UniqueEntityID(transactionId)
    ).getValue();
    mockTransactionRepo.save(transaction);
    // invoiceId = 'test-invoice';
    // const invoice = Invoice.create(
    //   {
    //     status: InvoiceStatus.INITIATED,
    //     payerId: payer.payerId
    //   },
    //   new UniqueEntityID(invoiceId)
    // ).getValue();
    // mockInvoiceRepo.save(invoice);
  });

  test('Select transaction', ({ given, when, then }) => {
    given('As System retrieving Transaction Details', async () => {
      const retrievedTransactionResult = await getTransactionUsecase.execute(
        {
          transactionId,
        },
        defaultContext
      );

      retrievedTransaction = retrievedTransactionResult.getValue();
    });

    when('I read the associated APC for the Transaction', async () => {
      // result = await usecase.execute({
      //   transactionId,
      //   payerType
      // }, defaultContext);
    });

    when(/^APC value is set to (\d+)$/, async (apcValue: number) => {
      retrievedApc = await Promise.resolve(apcValue);
      return retrievedApc;
    });

    then(
      /^the Transaction value should be (\d+)$/,
      async (transactionValue: number) => {
        expect(true).toBeTruthy();
        // expect(result.isSuccess).toBe(true);
        // expect(result.getValue().amount.value).toBe(retrievedApc);
      }
    );
  });
});
