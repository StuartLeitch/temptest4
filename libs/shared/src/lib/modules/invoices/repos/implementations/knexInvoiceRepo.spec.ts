import {
  UniqueEntityID,
  TransactionId,
  InvoiceStatus,
  Invoice,
  InvoiceId,
  InvoiceMap,
  clearTable,
  makeDb,
  destroyDb
} from '../../../../..';
import {RepoError} from '../../../../infrastructure/RepoError';
import {KnexInvoiceRepo as InvoiceRepo} from './knexInvoiceRepo';

function makeInvoiceData(overwrites?: any): Invoice {
  return InvoiceMap.toDomain({
    id: 'invoice-id-1',
    transactionId: 'transaction-id-1',
    status: InvoiceStatus.DRAFT,
    dateCreated: new Date(),
    deleted: 0,
    ...overwrites
  });
}

describe('InvoiceRepo', () => {
  let db: any;
  let repo: InvoiceRepo;

  beforeAll(async () => {
    db = await makeDb();
    repo = new InvoiceRepo(db);
  });

  afterAll(async () => destroyDb(db));

  describe('.getInvoiceById()', () => {
    afterAll(() => clearTable(db, 'invoices'));

    it('should find the invoice', async () => {
      const invoiceId = 'invoice-1';

      const invoice = makeInvoiceData({id: invoiceId});
      await repo.save(invoice);

      const foundInvoice = await repo.getInvoiceById(invoice.invoiceId);

      expect(foundInvoice).toEqual(invoice);
    });

    it('should reject with ENTITY_NOT_FOUND if invoice does not exist', async () => {
      const id = InvoiceId.create(new UniqueEntityID('unknown-id')).getValue();

      expect(
        repo.getInvoiceById(id)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Entity(invoice) with id[unknown-id] not found"`
      );
    });
  });

  describe('.getInvoiceByTransactionId()', () => {
    beforeAll(async () => {
      const invoice1 = makeInvoiceData({
        id: 'invoice-1',
        transactionId: 'transaction-1'
      });
      const invoice2 = makeInvoiceData({
        id: 'invoice-2',
        transactionId: 'transaction-1'
      });

      await db('invoices').insert(InvoiceMap.toPersistence(invoice1));
      await db('invoices').insert(InvoiceMap.toPersistence(invoice2));
    });

    afterAll(() => clearTable(db, 'invoices'));

    it('should return invoices with a transactionId', async () => {
      const transactionId = TransactionId.create(
        new UniqueEntityID('transaction-1')
      );

      const invoices = await repo.getInvoicesByTransactionId(transactionId);

      expect(invoices).toHaveLength(2);
    });

    it('should return [] if no transactions found', async () => {
      const transactionId = TransactionId.create(
        new UniqueEntityID('transaction-2')
      );

      const invoices = await repo.getInvoicesByTransactionId(transactionId);

      expect(invoices).toHaveLength(0);
    });
  });

  describe('CRUD methods', () => {
    let invoice: Invoice;
    beforeEach(async () => {
      invoice = makeInvoiceData({id: 'invoice-1'});
      await db('invoices').insert(InvoiceMap.toPersistence(invoice));
    });

    afterEach(() => clearTable(db, 'invoices'));

    describe('.delete()', () => {
      it('should delete the record', async () => {
        expect(repo.delete(invoice)).resolves.toBeTruthy();
      });

      it('should reject promise for unknown invoices', () => {
        const id = 'unknown-invoice';
        const invoice = makeInvoiceData({id});

        expect(repo.delete(invoice)).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Entity(invoice) with id[unknown-invoice] not found"`
        );
      });
    });

    describe('.update()', () => {
      it('should update record and return it', async () => {
        const invoiceId = InvoiceId.create(
          new UniqueEntityID('invoice-1')
        ).getValue();
        const invoice = await repo.getInvoiceById(invoiceId);
        const transactionId = TransactionId.create(
          new UniqueEntityID('transaction-1')
        );
        invoice.transactionId = transactionId;

        const updatedInvoice = await repo.update(invoice);
        expect(updatedInvoice.transactionId).toBe(transactionId);

        const savedInvoice = await repo.getInvoiceById(invoiceId);
        expect(savedInvoice.transactionId.toString()).toBe(
          transactionId.toString()
        );
      });

      it('should reject promise when invoice does not exist', async () => {
        const id = 'unknown-invoice';
        const invoice = makeInvoiceData({id});

        expect(repo.update(invoice)).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Entity(invoice) with id[unknown-invoice] not found"`
        );
      });
    });

    describe('.exists()', () => {
      it('should return true for existing invoices', async () => {
        const invoice = makeInvoiceData({id: 'invoice-1'});
        const result = await repo.exists(invoice);

        expect(result).toBe(true);
      });

      it('should return false for inexistent invoices', async () => {
        const invoice = makeInvoiceData({id: 'unknown-invoice'});
        const result = await repo.exists(invoice);

        expect(result).toBe(false);
      });
    });

    describe('.save()', () => {
      it('should save a new invoice', async () => {
        const invoice = makeInvoiceData({id: 'invoice-2'});
        const result = await repo.save(invoice);

        expect(result).toEqual(invoice);
      });

      it('should throw if invoice already exists', async () => {
        const invoice = makeInvoiceData({id: 'invoice-1'});
        expect(repo.save(invoice)).rejects.toThrow(RepoError);
      });
    });
  });
});
