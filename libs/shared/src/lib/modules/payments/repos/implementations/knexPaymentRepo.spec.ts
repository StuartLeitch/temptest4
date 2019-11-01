import {
  UniqueEntityID,
  Payment,
  PaymentId,
  PaymentMap
} from '../../../../shared';
import {Knex, makeDb, destroyDb, clearTable} from '../../../../infrastructure/database/knex';
import {KnexPaymentRepo} from './knexPaymentRepo';

const paymentData = {
  id: 'payment-1',
  payerId: 'payer-1',
  invoiceId: 'invoice-1',
  amount: 100,
  paymentMethodId: 'pay-method-1',
  foreignPaymentId: 'foreign-pay-1',
  datePaid: new Date(),
  paymentProof: {name: 'foo', src: 'bar'},
};

function makePaymentData(overwrites?: any): Payment {
  return PaymentMap.toDomain({
    ...paymentData,
    ...overwrites
  });
}

describe('KnexPaymentRepo', () => {
  let db: Knex;
  let repo: KnexPaymentRepo;

  beforeAll(async () => {
    db = await makeDb();
    repo = new KnexPaymentRepo(db);
  });

  afterAll(async () => destroyDb(db));

  describe('.getPaymentById()', () => {
    it('should return the payment entity', async () => {
      const id = 'payment-2';
      const payment = makePaymentData({id});
      await repo.save(payment);
      const foundPayment = await repo.getPaymentById(payment.paymentId);

      expect(foundPayment).toEqual(payment);
    });

    xit('should return raise error if payment does not exist', async () => {
      const id = PaymentId.create(new UniqueEntityID('unknown-id'));

      expect(
        repo.getPaymentById(id)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Entity(payment) with id[unknown-id] not found"`
      );
    });
  });

  describe('CRUD methods', () => {
    beforeEach(() => db('payments').insert(PaymentMap.toPersistence(makePaymentData({id: 'payment-1'}))));

    afterEach(() => clearTable(db, 'payments'));

    describe('.exists()', () => {
      it('should return true for existing payments', async () => {
        const payment = makePaymentData({id: 'payment-1'});
        const result = await repo.exists(payment);

        expect(result).toBe(true);
      });

      it('should return false for inexistent payments', async () => {
        const payment = makePaymentData({id: 'unknown-payment'});
        const result = await repo.exists(payment);

        expect(result).toBe(false);
      });
    });

    describe('.save()', () => {
      it('should save a new payment', async () => {
        const payment = makePaymentData({id: 'payment-2'});
        const result = await repo.save(payment);

        expect(result).toEqual(payment);
      });

      it('should throw if payment already exists', async () => {
        const payment = makePaymentData({id: 'payment-1'});
        expect(repo.save(payment)).rejects.toThrow();
      });
    });
  });
});
