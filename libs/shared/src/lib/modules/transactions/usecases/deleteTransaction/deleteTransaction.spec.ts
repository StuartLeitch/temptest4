import { Result } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Roles } from '../../../users/domain/enums/Roles';

import { MockTransactionRepo } from '../../repos/mocks/mockTransactionRepo';
import {
  Transaction,
  TransactionCollection,
  TransactionStatus,
} from '../../domain/Transaction';
import {
  DeleteTransactionUsecase,
  DeleteTransactionContext,
} from './deleteTransaction';

let usecase: DeleteTransactionUsecase;
let mockTransactionRepo: MockTransactionRepo;
let result: Result<Transaction | unknown>;

let transactionCollection: TransactionCollection;

let transactionId;

const defaultContext: DeleteTransactionContext = { roles: [Roles.SUPER_ADMIN] };

describe('DeleteTransactionUsecase', () => {
  beforeEach(async () => {
    mockTransactionRepo = new MockTransactionRepo();
    transactionId = 'test-transaction';
    const transaction = Transaction.create(
      {
        status: TransactionStatus.DRAFT,
      },
      new UniqueEntityID(transactionId)
    ).getValue();
    await mockTransactionRepo.save(transaction);
    usecase = new DeleteTransactionUsecase(mockTransactionRepo);
  });

  describe('When NO Transaction ID is provided', () => {
    it('should return an error', async () => {
      result = await usecase.execute({ transactionId: null }, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Transaction ID is provided', () => {
    it('should simply flag it as deleted', async () => {
      // * arrange
      transactionCollection = await mockTransactionRepo.getTransactionCollection();
      expect(transactionCollection.length).toEqual(1);

      result = await usecase.execute({ transactionId }, defaultContext);

      expect(result.isSuccess).toBeTruthy();

      // transactionCollection = await mockTransactionRepo.getTransactionCollection();
      // expect(transactionCollection.length).toEqual(1);

      // const [transaction] = transactionCollection;
      // expect(transaction.status).toBe(TransactionStatus.DRAFT);
    });
  });
});
