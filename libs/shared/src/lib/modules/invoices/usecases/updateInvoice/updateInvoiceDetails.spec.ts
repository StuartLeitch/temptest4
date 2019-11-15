import { Result } from '../../../../core/logic/Result';
import { Roles } from '../../../users/domain/enums/Roles';

import { MockPayerRepo } from '../../../payers/repos/mocks/mockPayerRepo';
import { PayerMap } from '../../../payers/mapper/Payer';
import {
  Payer,
  PayerType,
  PayerCollection
} from '../../../payers/domain/Payer';
import { PayerName } from '../../../payers/domain/PayerName';
import { TransactionId } from './../../../transactions/domain/TransactionId';

import { MockInvoiceRepo } from '../../repos/mocks/mockInvoiceRepo';
import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { InvoiceMap } from './../../mappers/InvoiceMap';

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

const defaultContext: UpdateInvoiceContext = { roles: [Roles.SUPER_ADMIN] };

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
      invoiceId = 'test-invoice';

      const payer = PayerMap.toDomain({
        id: payerId,
        invoiceId,
        name: 'foo',
        type: PayerType.INDIVIDUAL
      });

      mockPayerRepo.save(payer);

      const invoice = InvoiceMap.toDomain({
        payerId,
        id: invoiceId,
        status: InvoiceStatus.DRAFT,
        transactionId: 'transaction-2'
      });
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
        result = await usecase.execute(
          {
            invoiceId,
            name: 'name',
            payerType: PayerType.INDIVIDUAL
          },
          defaultContext
        );

        // expect(result.isSuccess).toBeTruthy();

        const secondPayerCollection = await mockPayerRepo.getCollection();
        expect(secondPayerCollection.length).toEqual(1);

        const [payer] = secondPayerCollection;
        expect(payer.type).toBe(PayerType.INDIVIDUAL);
      });
    });
  });
});
