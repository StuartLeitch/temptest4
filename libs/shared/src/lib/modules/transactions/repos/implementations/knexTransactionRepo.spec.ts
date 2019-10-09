import {
  UniqueEntityID,
  Transaction,
  TransactionId,
  TransactionMap,
  STATUS as TransactionStatus,
  clearTable,
  makeDb,
  destroyDb
} from '../../../../..';
import {KnexTransactionRepo} from './knexTransactionRepo';

function makeTransactionData(overwrites?: any): Transaction {
  return TransactionMap.toDomain({
    id: 'transaction-id-1',
    articleId: 'article-1',
    status: TransactionStatus.DRAFT,
    date: new Date(),
    dateCreated: new Date(),
    dateUpdated: new Date(),
    ...overwrites
  });
}

describe('TransactionKnexRepo', () => {
  let db: any;
  let repo: any;

  beforeAll(async () => {
    db = await makeDb();
    repo = new KnexTransactionRepo(db);
  });

  afterAll(async () => destroyDb(db));

  describe('.getTransactionById()', () => {
    afterAll(() => clearTable(db, 'transactions'));

    it('should find the transaction', async () => {
      const transaction = makeTransactionData({id: 'transaction-1'});
      await repo.save(transaction);

      const foundTransaction = await repo.getTransactionById(
        transaction.transactionId
      );

      expect(foundTransaction).toEqual(transaction);
    });

    it('should return null if transaction does not exist', async () => {
      const id = TransactionId.create(new UniqueEntityID('unknown-id'));

      const foundTransaction = await repo.getTransactionById(id);

      expect(foundTransaction).toBeNull();
    });
  });

  describe('CRUD methods', () => {
    beforeEach(() =>
      db('transactions').insert(
        TransactionMap.toPersistence(makeTransactionData({id: 'transaction-1'}))
      )
    );

    afterEach(() => clearTable(db, 'transactions'));

    describe('.delete()', () => {
      it('should delete the record', async () => {
        const transaction = await repo.getTransactionById(
          TransactionId.create(new UniqueEntityID('transaction-1'))
        );

        expect(repo.delete(transaction)).resolves.toBeTruthy();
      });

      it('should reject promise for unknown transactions', () => {
        const transaction = makeTransactionData({
          id: 'unknown-transaction'
        });

        expect(repo.delete(transaction)).rejects.toThrow();
      });
    });

    describe('.exists()', () => {
      it('should return true for existing transactions', async () => {
        const transaction = makeTransactionData({id: 'transaction-1'});
        const result = await repo.exists(transaction);

        expect(result).toBe(true);
      });

      it('should return false for inexistent transactions', async () => {
        const transaction = makeTransactionData({id: 'unknown-transaction'});
        const result = await repo.exists(transaction);

        expect(result).toBe(false);
      });
    });

    describe('.save()', () => {
      it('should save a new transaction', async () => {
        const transaction = makeTransactionData({id: 'transaction-2'});
        const result = await repo.save(transaction);

        expect(result).toEqual(transaction);
      });

      it('should throw if transaction already exists', async () => {
        const transaction = makeTransactionData({id: 'transaction-1'});
        expect(repo.save(transaction)).rejects.toThrow();
      });
    });

    describe('.update()', () => {
      it('should update record and return it', async () => {
        const transactionId = TransactionId.create(
          new UniqueEntityID('transaction-1')
        );
        const transaction = await repo.getTransactionById(transactionId);
        transaction.markAsFinal();

        const updatedTransaction = await repo.update(transaction);
        expect(updatedTransaction.status).toBe(TransactionStatus.FINAL);

        const savedTransaction = await repo.getTransactionById(transactionId);
        expect(savedTransaction.status).toBe(TransactionStatus.FINAL);
      });

      it('should reject promise when transaction does not exist', async () => {
        const transaction = makeTransactionData({
          id: 'unknown-transaction'
        });

        expect(repo.update(transaction)).rejects.toThrow();
      });
    });
  });
});
