import { Result } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Roles } from '../../../users/domain/enums/Roles';

import { MockTransactionRepo } from '../../repos/mocks/mockTransactionRepo';
import { Transaction, TransactionStatus } from '../../domain/Transaction';
import {
  UpdateTransactionUsecase,
  UpdateTransactionContext,
} from './updateTransaction';

let usecase: UpdateTransactionUsecase;
let mockTransactionRepo: MockTransactionRepo;
let result: Result<Transaction>;

let transactionId: string;

const defaultContext: UpdateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

describe('UpdateTransactionUsecase', () => {
  describe('When NO Transaction ID is provided', () => {
    beforeEach(() => {
      mockTransactionRepo = new MockTransactionRepo();

      usecase = new UpdateTransactionUsecase(mockTransactionRepo);
    });

    it('should fail', async () => {
      // * act
      result = await usecase.execute({}, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Transaction ID is provided', () => {
    beforeEach(async () => {
      mockTransactionRepo = new MockTransactionRepo();

      transactionId = 'test-transaction';
      const transaction = Transaction.create(
        {
          status: TransactionStatus.DRAFT,
          // surname: PayerName.create('bar').getValue()
        },
        new UniqueEntityID(transactionId)
      ).getValue();
      await mockTransactionRepo.save(transaction);

      usecase = new UpdateTransactionUsecase(mockTransactionRepo);
    });

    describe('And Transaction ID is INVALID', () => {
      it('should fail', async () => {
        result = await usecase.execute(
          {
            transactionId: null,
          },
          defaultContext
        );
        expect(result.isFailure).toBeTruthy();
      });
    });

    describe('And Transaction ID is VALID', () => {
      it('should return the transaction details', async () => {
        // arrange
        result = await usecase.execute(
          {
            transactionId,
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();
        expect(
          result.getValue().transactionId.id.toString() === transactionId
        ).toBeTruthy();
      });
    });

    describe('And amount is VALID', () => {
      it('should return the updated transaction details', async () => {
        // arrange
        const amount = 100;
        result = await usecase.execute(
          {
            transactionId,
            amount,
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();
        // expect(result.getValue().amount.value === amount).toBeTruthy();
      });
    });
  });
});
