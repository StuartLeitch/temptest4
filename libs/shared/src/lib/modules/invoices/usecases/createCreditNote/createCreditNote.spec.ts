import { TransactionMap } from '../../../transactions/mappers/TransactionMap';
import { MockTransactionRepo } from '../../../transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceRepo } from '../../repos/mocks/mockInvoiceRepo';
import { InvoiceCollection } from '../../domain/Invoice';

// * Usecases imports
import {
  Roles,
  CreateCreditNoteAuthorizationContext
} from './createCreditNoteAuthorizationContext';
import { CreateCreditNoteUsecase } from './createCreditNote';
import { CreateCreditNoteResponse } from './createCreditNoteResponse';

const defaultContext: CreateCreditNoteAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN]
};

let usecase: CreateCreditNoteUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let mockTransactionRepo: MockTransactionRepo;
let result: CreateCreditNoteResponse;

const transactionId = 'transaction-foo';

describe('Create Credit Note UseCase', () => {
  beforeEach(() => {
    mockInvoiceRepo = new MockInvoiceRepo();
    mockTransactionRepo = new MockTransactionRepo();

    const transaction = TransactionMap.toDomain({
      id: transactionId
    });
    mockTransactionRepo.addMockItem(transaction);

    usecase = new CreateCreditNoteUsecase(mockInvoiceRepo, mockTransactionRepo);
  });

  afterEach(() => {
    mockInvoiceRepo.clear();
    mockTransactionRepo.clear();
  });

  it('should create a new Invoice', async () => {
    const invoiceCollectionBefore: InvoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
    expect(invoiceCollectionBefore.length).toEqual(0);

    result = await usecase.execute(
      {
        transactionId
      },
      defaultContext
    );
    expect(result.value.isSuccess).toBe(true);

    const invoiceCollectionAfter: InvoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
    expect(invoiceCollectionAfter.length).toEqual(1);
  });
});
