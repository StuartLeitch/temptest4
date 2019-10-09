import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockTransactionRepo} from '../../../transactions/repos/mocks/mockTransactionRepo';
import {
  Transaction,
  TransactionCollection,
  STATUS as TransactionStatus
} from '../../../transactions/domain/Transaction';

import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {Invoice, InvoiceCollection, InvoiceStatus} from '../../domain/Invoice';
import {CreateInvoiceContext, CreateInvoiceUsecase} from './createInvoice';

let usecase: CreateInvoiceUsecase;
let mockTransactionRepo: MockTransactionRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let result: Result<Invoice>;

let invoiceCollection: InvoiceCollection;

// let mockInvoiceRepo: MockInvoiceRepo;
let transactionCollection: TransactionCollection;
let transactionId;

const defaultContext: CreateInvoiceContext = {roles: [Roles.SUPER_ADMIN]};

describe('CreateInvoiceUseCase', () => {
  beforeEach(() => {
    mockTransactionRepo = new MockTransactionRepo();
    mockInvoiceRepo = new MockInvoiceRepo();

    usecase = new CreateInvoiceUsecase(mockInvoiceRepo, mockTransactionRepo);
  });

  describe('When NO Transaction ID is provided', () => {
    it('should still create a draft invoice', async () => {
      // * act
      result = await usecase.execute({}, defaultContext);

      expect(result.isSuccess).toBeTruthy();
    });
  });

  describe('When Transaction ID is provided', () => {
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

    describe('And Transaction ID is INVALID', () => {
      it('should NOT create a draft invoice', async () => {
        result = await usecase.execute(
          {
            transactionId: null
          },
          defaultContext
        );
        expect(result.isFailure).toBeTruthy();
      });
    });

    describe('And Transaction ID is VALID', () => {
      it('should create a draft invoice', async () => {
        // arrange
        transactionCollection = await mockTransactionRepo.getTransactionCollection();
        expect(transactionCollection.length).toEqual(1);
        invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
        expect(invoiceCollection.length).toEqual(0);

        result = await usecase.execute(
          {
            transactionId
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();

        invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
        expect(invoiceCollection.length).toEqual(1);
      });
    });
  });
});
