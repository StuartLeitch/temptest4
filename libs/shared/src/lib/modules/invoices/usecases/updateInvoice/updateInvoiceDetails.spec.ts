import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockPayerRepo} from '../../../payers/repos/mocks/mockPayerRepo';
import {Payer, PayerCollection} from '../../../payers/domain/Payer';
import {PayerName} from '../../../payers/domain/PayerName';
import {PayerType} from '../../../payers/domain/PayerType';

import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {Invoice, InvoiceStatus} from '../../domain/Invoice';

import {
  UpdateInvoiceDetailsUsecase,
  UpdateInvoiceContext
} from './updateInvoiceDetails';

let usecase: UpdateInvoiceDetailsUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let mockPayerRepo: MockPayerRepo;
let result: Result<Invoice>;
let payerCollection: PayerCollection;

let invoiceId;
let payerId;

const defaultContext: UpdateInvoiceContext = {roles: [Roles.SUPER_ADMIN]};

describe('UpdateInvoiceDetailsUsecase', () => {
  describe('When NO Invoice ID is provided', () => {
    beforeEach(() => {
      mockInvoiceRepo = new MockInvoiceRepo();

      usecase = new UpdateInvoiceDetailsUsecase(mockInvoiceRepo, mockPayerRepo);
    });

    it('should fail', async () => {
      // * act
      result = await usecase.execute({}, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Invoice ID is provided', () => {
    beforeEach(() => {
      mockPayerRepo = new MockPayerRepo();
      mockInvoiceRepo = new MockInvoiceRepo();

      payerId = 'test-payer';
      const payer = Payer.create(
        {
          name: PayerName.create('foo').getValue(),
          surname: PayerName.create('bar').getValue(),
          type: PayerType.create('individual').getValue()
        },
        new UniqueEntityID(payerId)
      ).getValue();

      mockPayerRepo.save(payer);

      invoiceId = 'test-invoice';
      const invoice = Invoice.create(
        {
          status: InvoiceStatus.DRAFT,
          payerId: payer.payerId
        },
        new UniqueEntityID(invoiceId)
      ).getValue();
      mockInvoiceRepo.save(invoice);

      usecase = new UpdateInvoiceDetailsUsecase(mockInvoiceRepo, mockPayerRepo);
    });

    describe('And Invoice ID is INVALID', () => {
      it('should fail', async () => {
        result = await usecase.execute(
          {
            invoiceId: null
          },
          defaultContext
        );
        expect(result.isFailure).toBeTruthy();
      });
    });

    describe('And Invoice ID is VALID', () => {
      it('should return the payer details', async () => {
        // arrange
        result = await usecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();
        expect(
          result.getValue().invoiceId.id.toString() === invoiceId
        ).toBeTruthy();
      });
    });

    describe('And Payer type is VALID', () => {
      it('should return the updated invoice details', async () => {
        payerCollection = await mockPayerRepo.getCollection();
        expect(payerCollection.length).toEqual(1);
        // arrange
        const payerType = 'foobar';
        result = await usecase.execute(
          {
            invoiceId,
            payerType
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();

        payerCollection = await mockPayerRepo.getCollection();
        expect(payerCollection.length).toEqual(1);

        const [payer] = payerCollection;
        expect(payer.type.value).toBe(payerType);
      });
    });
  });
});
