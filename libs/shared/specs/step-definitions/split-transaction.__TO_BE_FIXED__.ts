import {defineFeature, loadFeature} from 'jest-cucumber';

import {UniqueEntityID} from '../../lib/core/domain/UniqueEntityID';
import {Roles} from '../../lib/modules/users/domain/enums/Roles';

import {Payer} from '../../lib/modules/payers/domain/Payer';
import {PayerName} from '../../lib/modules/payers/domain/PayerName';
import {PayerType} from '../../lib/modules/payers/domain/PayerType';
import {
  Invoice,
  STATUS as InvoiceStatus
} from '../../lib/modules/invoices/domain/Invoice';
import {
  GetTransactionUsecase,
  GetTransactionContext
} from '../../lib/modules/transactions/usecases/getTransaction/getTransaction';

import {MockTransactionRepo} from '../../lib/modules/transactions/repos/mocks/mockTransactionRepo';
import {
  Transaction,
  STATUS as TransactionStatus
} from '../../lib/modules/transactions/domain/Transaction';
import {TransactionAmount} from '../../lib/modules/transactions/domain/TransactionAmount';

const feature = loadFeature('./specs/features/split-transaction.feature');

const defaultContext: GetTransactionContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  let mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();

  let payer1: Payer;
  let payer2: Payer;
  let transactionId: string;
  let invoiceId: string;

  let getTransactionUsecase: GetTransactionUsecase = new GetTransactionUsecase(
    mockTransactionRepo
  );
  let retrievedTransaction: Transaction;

  beforeEach(() => {
    transactionId = 'test-transaction';
    const transaction = Transaction.create(
      {
        status: TransactionStatus.DRAFT
      },
      new UniqueEntityID(transactionId)
    ).getValue();

    mockTransactionRepo.save(transaction);
  });

  afterEach(() => {
    retrievedTransaction.clearInvoices();
  });

  test('Adjust two ways split transaction', ({given, when, and, then}) => {
    given('As System editing Transaction Details', async () => {
      const retrievedTransactionResult = await getTransactionUsecase.execute(
        {
          transactionId
        },
        defaultContext
      );

      retrievedTransaction = retrievedTransactionResult.getValue();
    });

    when(/^Transaction value is (\d+)$/, (transactionAmount: string) => {
      retrievedTransaction.amount = TransactionAmount.create(
        parseInt(transactionAmount, 10)
      ).getValue();
    });

    and('I add a new Payer', async () => {
      const payer1Id = 'test-payer1';
      payer1 = Payer.create(
        {
          name: PayerName.create('Foo1').getValue(),
          surname: PayerName.create('Bar1').getValue(),
          type: PayerType.create('FooBar1').getValue()
        },
        new UniqueEntityID(payer1Id)
      ).getValue();

      invoiceId = 'test-invoice1';
      const invoice1 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer1.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      retrievedTransaction.addInvoice(invoice1);
    });

    then(
      /^the new draft Invoice value should be (\d+)$/,
      async (draftInvoiceValue: string) => {
        expect(retrievedTransaction.invoices.length).toEqual(1);
        const [associatedInvoice] = retrievedTransaction.invoices;

        expect(associatedInvoice.netAmount).toEqual(
          parseInt(draftInvoiceValue, 10)
        );
      }
    );

    when('I add a new Payer', async () => {
      const payer2Id = 'test-payer2';
      payer2 = Payer.create(
        {
          name: PayerName.create('Foo2').getValue(),
          surname: PayerName.create('Bar2').getValue(),
          type: PayerType.create('FooBar2').getValue()
        },
        new UniqueEntityID(payer2Id)
      ).getValue();

      invoiceId = 'test-invoice2';
      const invoice2 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer2.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      retrievedTransaction.addInvoice(invoice2);
    });

    then('Another new draft Invoice should be created', () => {
      expect(retrievedTransaction.invoices.length).toEqual(2);
    });

    and(
      /^Both invoices should have value of (\d+)$/,
      (splitInvoicesValue: string) => {
        const [invoice1, invoice2] = retrievedTransaction.invoices;

        expect(invoice1.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
        expect(invoice2.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
      }
    );
  });

  test('Adjust three ways split transaction', ({given, when, and, then}) => {
    given('As System editing Transaction Details', async () => {
      const retrievedTransactionResult = await getTransactionUsecase.execute(
        {
          transactionId
        },
        defaultContext
      );

      retrievedTransaction = retrievedTransactionResult.getValue();
    });

    when(/^Transaction value is (\d+)$/, (transactionAmount: string) => {
      retrievedTransaction.amount = TransactionAmount.create(
        parseInt(transactionAmount, 10)
      ).getValue();
    });

    and('I add a new Payer', async () => {
      const payer1Id = 'test-payer1';
      payer1 = Payer.create(
        {
          name: PayerName.create('Foo1').getValue(),
          surname: PayerName.create('Bar1').getValue(),
          type: PayerType.create('FooBar1').getValue()
        },
        new UniqueEntityID(payer1Id)
      ).getValue();

      invoiceId = 'test-invoice1';
      const invoice1 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer1.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      retrievedTransaction.addInvoice(invoice1);
    });

    then(
      /^the new draft Invoice value should be (\d+)$/,
      async (draftInvoiceValue: string) => {
        expect(retrievedTransaction.invoices.length).toEqual(1);
        const [associatedInvoice] = retrievedTransaction.invoices;

        expect(associatedInvoice.netAmount).toEqual(
          parseInt(draftInvoiceValue, 10)
        );
      }
    );

    when('I add two Payers', () => {
      const payer2Id = 'test-payer2';
      payer2 = Payer.create(
        {
          name: PayerName.create('Foo2').getValue(),
          surname: PayerName.create('Bar2').getValue(),
          type: PayerType.create('FooBar2').getValue()
        },
        new UniqueEntityID(payer2Id)
      ).getValue();

      invoiceId = 'test-invoice2';
      const invoice2 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer2.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      const payer3Id = 'test-payer3';
      const payer3 = Payer.create(
        {
          name: PayerName.create('Foo3').getValue(),
          surname: PayerName.create('Bar3').getValue(),
          type: PayerType.create('FooBar3').getValue()
        },
        new UniqueEntityID(payer3Id)
      ).getValue();

      invoiceId = 'test-invoice3';
      const invoice3 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer3.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      retrievedTransaction.addInvoice(invoice2);
      retrievedTransaction.addInvoice(invoice3);
    });

    then('Another two draft Invoice should be created', () => {
      expect(retrievedTransaction.invoices.length).toEqual(3);
    });

    and(
      /^All invoices should have value of (\d+)$/,
      (splitInvoicesValue: string) => {
        const [invoice1, invoice2, invoice3] = retrievedTransaction.invoices;

        expect(invoice1.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
        expect(invoice2.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
        expect(invoice3.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
      }
    );
  });

  test('Adjust two ways split transaction when payer is removed', ({
    given,
    when,
    and,
    then
  }) => {
    given('As System editing Transaction Details', async () => {
      const retrievedTransactionResult = await getTransactionUsecase.execute(
        {
          transactionId
        },
        defaultContext
      );

      retrievedTransaction = retrievedTransactionResult.getValue();
    });

    when(/^Transaction value is (\d+)$/, (transactionAmount: string) => {
      retrievedTransaction.amount = TransactionAmount.create(
        parseInt(transactionAmount, 10)
      ).getValue();
    });

    and('I add three new Payers', () => {
      let payerId = 'test-payer1';
      payer1 = Payer.create(
        {
          name: PayerName.create('Foo1').getValue(),
          surname: PayerName.create('Bar1').getValue(),
          type: PayerType.create('FooBar1').getValue()
        },
        new UniqueEntityID(payerId)
      ).getValue();

      payerId = 'test-payer2';
      payer2 = Payer.create(
        {
          name: PayerName.create('Foo2').getValue(),
          surname: PayerName.create('Bar2').getValue(),
          type: PayerType.create('FooBar2').getValue()
        },
        new UniqueEntityID(payerId)
      ).getValue();

      payerId = 'test-payer3';
      const payer3 = Payer.create(
        {
          name: PayerName.create('Foo3').getValue(),
          surname: PayerName.create('Bar3').getValue(),
          type: PayerType.create('FooBar3').getValue()
        },
        new UniqueEntityID(payerId)
      ).getValue();

      invoiceId = 'test-invoice1';
      const invoice1 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer1.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      invoiceId = 'test-invoice2';
      const invoice2 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer2.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      invoiceId = 'test-invoice3';
      const invoice3 = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer3.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      retrievedTransaction.addInvoice(invoice1);
      retrievedTransaction.addInvoice(invoice2);
      retrievedTransaction.addInvoice(invoice3);
    });

    then(
      /^All invoices should have value of (\d+)$/,
      (splitInvoicesValue: string) => {
        const [invoice1, invoice2, invoice3] = retrievedTransaction.invoices;

        expect(invoice1.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
        expect(invoice2.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
        expect(invoice3.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
      }
    );

    when('I remove one Payer', () => {
      const [invoice1] = retrievedTransaction.invoices;
      retrievedTransaction.removeInvoice(invoice1);
    });

    then('Transaction should only have 2 invoices', () => {
      expect(retrievedTransaction.invoices.length).toEqual(2);
    });

    and(
      /^Both invoices should have value of (\d+)$/,
      (splitInvoicesValue: string) => {
        const [invoice1, invoice2] = retrievedTransaction.invoices;

        expect(invoice1.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
        expect(invoice2.netAmount).toEqual(parseInt(splitInvoicesValue, 10));
      }
    );
  });
});
