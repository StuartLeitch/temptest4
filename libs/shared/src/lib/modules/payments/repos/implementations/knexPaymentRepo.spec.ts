import {
  UniqueEntityID,
  Payment,
  PaymentId,
  PaymentMap,
  clearTable,
  makeDb,
  destroyDb
} from '../../../../..';
import {KnexPaymentRepo} from './knexPaymentRepo';

function makePaymentData(overwrites?: any): Payment {
  return PaymentMap.toDomain({
    id: 'payment-1',
    payerId: 'payer-1',
    invoiceId: 'invoice-1',
    amount: 100,
    paymentMethodId: 'pay-method-1',
    foreignPaymentId: 'foreign-pay-1',
    datePaid: new Date(),
    paymentProof: {name: 'foo', src: 'bar'},
    ...overwrites
  });
}

describe('KnexPaymentRepo', () => {
  let db: any;
  let repo: any;

  beforeAll(async () => {
    db = await makeDb();
    repo = new KnexPaymentRepo(db);
  });

  afterAll(async () => destroyDb(db));

  describe('.getPaymentById()', () => {
    it('should return the payment entity', async () => {
      const id: string = 'payment-2';
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

  xdescribe('CRUD methods', () => {
    beforeEach(() => db('payments').insert(makePaymentData({id: 'payment-1'})));

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
