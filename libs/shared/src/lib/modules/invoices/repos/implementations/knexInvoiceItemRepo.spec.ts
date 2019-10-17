import {
  UniqueEntityID,
  InvoiceId,
  InvoiceItem,
  InvoiceItemId,
  InvoiceItemMap,
  clearTable,
  makeDb,
  destroyDb
} from '../../../../..';
import {RepoError} from '../../../../infrastructure/RepoError';
import {KnexInvoiceItemRepo as InvoiceItemRepo} from './knexInvoiceItemRepo';

function makeInvoiceItemData(overwrites?: any): InvoiceItem {
  return InvoiceItemMap.toDomain({
    id: 'invoice--item-id-1',
    manuscriptId: 'manuscript-id-1',
    invoiceId: 'invoice-id-1',
    price: 0,
    dateCreated: new Date(),
    ...overwrites
  });
}

describe('InvoiceItemRepo', () => {
  let db: any;
  let repo: InvoiceItemRepo;

  beforeAll(async () => {
    db = await makeDb();
    repo = new InvoiceItemRepo(db);
  });

  afterAll(async () => destroyDb(db));

  describe('.getInvoiceItemById()', () => {
    afterAll(() => clearTable(db, 'invoice_items'));

    it('should find the invoice item', async () => {
      const invoiceItemId = 'invoice-item-1';

      const invoiceItem = makeInvoiceItemData({id: invoiceItemId});
      await repo.save(invoiceItem);

      const foundInvoiceItem = await repo.getInvoiceItemById(
        invoiceItem.invoiceItemId
      );

      expect(foundInvoiceItem).toEqual(invoiceItem);
    });

    it('should reject with ENTITY_NOT_FOUND if invoice item does not exist', async () => {
      const id = new UniqueEntityID('unknown-invoice-item');

      expect(
        repo.getInvoiceItemById(InvoiceItemId.create(id))
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Entity(invoice item) with id[unknown-invoice-item] not found"`
      );
    });
  });

  describe('CRUD methods', () => {
    let invoiceItem: InvoiceItem;
    beforeEach(async () => {
      invoiceItem = makeInvoiceItemData({id: 'invoice-item-1'});
      await db('invoice_items').insert(
        InvoiceItemMap.toPersistence(invoiceItem)
      );
    });

    afterEach(() => clearTable(db, 'invoice_items'));

    describe('.delete()', () => {
      it('should soft delete the record', async () => {
        expect(repo.delete(invoiceItem)).resolves.toBeFalsy();
      });

      it('should reject promise for unknown invoice items', () => {
        const id = 'unknown-item-id';
        const invoiceItem = makeInvoiceItemData({id});

        expect(
          repo.delete(invoiceItem)
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Entity(invoice item) with id[unknown-item-id] not found"`
        );
      });
    });

    describe('.update()', () => {
      it('should update record and return it', async () => {
        const invoiceItemId = InvoiceItemId.create(
          new UniqueEntityID('invoice-item-1')
        );
        const invoiceItem = await repo.getInvoiceItemById(invoiceItemId);
        const invoiceItemPrice = 0;
        invoiceItem.price = invoiceItemPrice;

        const updatedInvoiceItem = await repo.update(invoiceItem);
        expect(updatedInvoiceItem.price).toEqual(invoiceItemPrice);

        const savedInvoiceItem = await repo.getInvoiceItemById(invoiceItemId);
        expect(savedInvoiceItem.price).toEqual(invoiceItemPrice);
      });

      it('should reject promise when invoice item does not exist', async () => {
        const id = 'unknown-invoice-item';
        const invoiceItem = makeInvoiceItemData({id});

        expect(
          repo.update(invoiceItem)
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Entity(invoice item) with id[unknown-invoice-item] not found"`
        );
      });
    });

    describe('.exists()', () => {
      it('should return true for existing invoice items', async () => {
        const invoiceItem = makeInvoiceItemData({id: 'invoice-item-1'});
        const result = await repo.exists(invoiceItem);

        expect(result).toBe(true);
      });

      it('should return false for inexistent invoice items', async () => {
        const invoiceItem = makeInvoiceItemData({id: 'unknown-invoice-item'});
        const result = await repo.exists(invoiceItem);

        expect(result).toBe(false);
      });
    });

    describe('.save()', () => {
      it('should save a new invoice item', async () => {
        const invoiceItem = makeInvoiceItemData({id: 'invoice-item-2'});
        const result = await repo.save(invoiceItem);

        expect(result).toEqual(invoiceItem);
      });

      it('should throw if invoice item already exists', async () => {
        const invoiceItem = makeInvoiceItemData({id: 'invoice-item-1'});
        expect(repo.save(invoiceItem)).rejects.toThrow(RepoError);
      });
    });
  });
});
