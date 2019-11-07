import {TransactionMap} from './../../../transactions/mappers/TransactionMap';
import {MockTransactionRepo} from './../../../transactions/repos/mocks/mockTransactionRepo';
import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {InvoiceCollection} from '../../domain/Invoice';

// * Usecases imports
import {
  Roles,
  CreateInvoiceAuthorizationContext
} from './createInvoiceAuthorizationContext';
import {CreateInvoiceUsecase} from './createInvoice';
import {CreateInvoiceResponse} from './createInvoiceResponse';

const defaultContext: CreateInvoiceAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN]
};

let usecase: CreateInvoiceUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let mockTransactionRepo: MockTransactionRepo;
let result: CreateInvoiceResponse;
let invoiceCollection: InvoiceCollection;

const transactionId = 'transaction-foo';

describe('Create Invoice UseCase', () => {
  beforeEach(() => {
    mockInvoiceRepo = new MockInvoiceRepo();
    mockTransactionRepo = new MockTransactionRepo();

    const transaction = TransactionMap.toDomain({
      id: transactionId
    });
    mockTransactionRepo.addMockItem(transaction);

    usecase = new CreateInvoiceUsecase(mockInvoiceRepo, mockTransactionRepo);
  });

  afterEach(() => {
    mockInvoiceRepo.clear();
    mockTransactionRepo.clear();
  });

  it('should create a new Invoice', async () => {
    invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
    expect(invoiceCollection.length).toEqual(0);

    result = await usecase.execute(
      {
        transactionId
      },
      defaultContext
    );
    expect(result.value.isSuccess).toBe(true);

    invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
    expect(invoiceCollection.length).toEqual(1);
  });
});
