import {
  UniqueEntityID,
  PaymentMethod,
  PaymentMethodMap,
  PaymentMethodId,
  clearTable,
  makeDb,
  destroyDb
} from '../../../..';
import {KnexPaymentMethodRepo as PaymentMethodRepo} from './knexPaymentMethodRepo';

function makePaymentMethodData(overwrites?: any): PaymentMethod {
  return PaymentMethodMap.toDomain({
    id: 'paymentMethod-1',
    name: 'Credit Card',
    isActive: true,
    // datePaid: new Date(row.datePaid),
    paymentProof: {},
    // paymentProof: JSON.stringify(paymentData.paymentProof)
    ...overwrites
  });
}

describe('PaymentMethodRepo', () => {
  let db: any;
  let repo: any;

  beforeAll(async () => {
    db = await makeDb();
    repo = new PaymentMethodRepo(db);
  });

  afterAll(async () => destroyDb(db));

  describe('.getPaymentMethodById()', () => {
    it('should return the paymentMethod entity', async () => {
      const id: string = 'paymentMethod-2';
      const paymentMethod = makePaymentMethodData({id});
      await repo.save(paymentMethod);

      const foundPayment = await repo.getPaymentMethodById(
        paymentMethod.paymentMethodId
      );

      expect(foundPayment).toEqual(paymentMethod);
    });

    it('should throw if paymentMethod does not exist', async () => {
      const id = PaymentMethodId.create(new UniqueEntityID('unknown-id'));

      expect(
        repo.getPaymentMethodById(id)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Entity(payment-method) with id[unknown-id] not found"`
      );
    });
  });

  describe('CRUD methods', () => {
    beforeEach(() =>
      db('payment_methods').insert(
        PaymentMethodMap.toPersistence(
          makePaymentMethodData({id: 'paymentMethod-1'})
        )
      )
    );

    afterEach(() => clearTable(db, 'payment_methods'));

    describe('.exists()', () => {
      it('should return true for existing payment_methods', async () => {
        const paymentMethod = makePaymentMethodData({id: 'paymentMethod-1'});
        const result = await repo.exists(paymentMethod);

        expect(result).toBe(true);
      });

      it('should return false for inexistent payment_methods', async () => {
        const paymentMethod = makePaymentMethodData({
          id: 'unknown-paymentMethod'
        });
        const result = await repo.exists(paymentMethod);

        expect(result).toBe(false);
      });
    });

    describe('.save()', () => {
      it('should save a new paymentMethod', async () => {
        const paymentMethod = makePaymentMethodData({
          id: 'paymentMethod-2'
        });
        const result = await repo.save(paymentMethod);

        expect(result).toEqual(paymentMethod);
      });

      it('should throw if paymentMethod already exists', async () => {
        const paymentMethod = makePaymentMethodData({
          id: 'paymentMethod-1'
        });
        expect(repo.save(paymentMethod)).rejects.toThrow();
      });
    });
  });
});
