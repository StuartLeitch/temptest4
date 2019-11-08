import {UniqueEntityID, Payer, PayerMap, PayerId} from '../../../../shared';
import {
  Knex,
  clearTable,
  makeDb,
  destroyDb
} from '../../../../infrastructure/database/knex';
import {KnexPayerRepo} from './knexPayerRepo';

const payerData = {
  id: 'payer-1',
  type: PayerType.INDIVIDUAL,
  title: 'Mr',
  name: 'Skywalker',
  organization: 'Rebel Alliance',
  uniqueIdentificationNumber: '123456233',
  email: 'luke@rebelalliance.universe',
  phone: '911',
  shippingAddressId: 'Tatooine',
  billingAddressId: 'Tatooine',
  vatId: 'vat-1',
  dateAdded: new Date()
};

function makePayerData(overwrites?: any): Payer {
  return PayerMap.toDomain({
    ...payerData,
    ...overwrites
  });
}

describe('KnexPayerRepo', () => {
  let db: Knex;
  let repo: KnexPayerRepo;

  beforeAll(async () => {
    db = await makeDb();
    repo = new KnexPayerRepo(db);
  });

  afterAll(async () => destroyDb(db));

  describe('.getPayerById()', () => {
    it('should return the payer entity', async () => {
      const payer = makePayerData({id: 'payer-2'});
      await repo.save(payer);

      const foundPayer = await repo.getPayerById(payer.payerId);

      expect(foundPayer).toEqual(payer);
    });

    it('should throw if payer does not exist', async () => {
      const id = PayerId.create(new UniqueEntityID('unknown-id'));

      expect(repo.getPayerById(id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Entity(payer) with id[unknown-id] not found"`
      );
    });
  });

  describe('CRUD methods', () => {
    beforeEach(() =>
      db('payers').insert(
        PayerMap.toPersistence(makePayerData({id: 'payer-1'}))
      )
    );

    afterEach(() => clearTable(db, 'payers'));

    describe('.exists()', () => {
      it('should return true for existing payers', async () => {
        const payer = makePayerData({id: 'payer-1'});
        const result = await repo.exists(payer);

        expect(result).toBe(true);
      });

      it('should return false for inexistent payers', async () => {
        const payer = makePayerData({id: 'unknown-entity'});
        const result = await repo.exists(payer);

        expect(result).toBe(false);
      });
    });

    describe('.save()', () => {
      it('should save a new payer', async () => {
        const payer = makePayerData({id: 'payer-2'});
        const result = await repo.save(payer);

        expect(result).toEqual(payer);
      });

      it('should throw if payer already exists', async () => {
        const payer = makePayerData({id: 'payer-1'});
        expect(repo.save(payer)).rejects.toThrow();
      });
    });
  });
});
