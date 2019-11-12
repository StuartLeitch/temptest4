import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockTransactionRepo} from '../../repos/mocks/mockTransactionRepo';
import {
  Transaction,
  STATUS as TransactionStatus
} from '../../domain/Transaction';
// import {TransactionAmount} from '../../domain/TransactionAmount';
import {GetTransactionUsecase, GetTransactionContext} from './getTransaction';

let usecase: GetTransactionUsecase;
let mockTransactionRepo: MockTransactionRepo;
let result: Result<Transaction>;
let transactionId: string;

const defaultContext: GetTransactionContext = {roles: [Roles.SUPER_ADMIN]};

describe('GetTransactionUsecase', () => {
  describe('When NO Transaction ID is provided', () => {
    beforeEach(() => {
      mockTransactionRepo = new MockTransactionRepo();

      usecase = new GetTransactionUsecase(mockTransactionRepo);
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
        {status: TransactionStatus.DRAFT},
        new UniqueEntityID(transactionId)
      ).getValue();
      await mockTransactionRepo.save(transaction);

      usecase = new GetTransactionUsecase(mockTransactionRepo);
    });

    describe('And Payer ID is INVALID', () => {
      it('should fail', async () => {
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
      it('should return the transaction details', async () => {
        // arrange
        result = await usecase.execute(
          {
            transactionId
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();
        expect(
          result.getValue().transactionId.id.toString() === transactionId
        ).toBeTruthy();
      });
    });
  });
});
