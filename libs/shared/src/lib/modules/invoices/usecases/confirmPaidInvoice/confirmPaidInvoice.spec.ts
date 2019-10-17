import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {Invoice, InvoiceCollection, InvoiceStatus} from '../../domain/Invoice';
import {TransactionId} from './../../../transactions/domain/TransactionId';
import {
  ConfirmPaidInvoiceUsecase,
  ConfirmPaidInvoiceContext
} from './confirmPaidInvoice';

let usecase: ConfirmPaidInvoiceUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let result: Result<Invoice>;

let invoiceCollection: InvoiceCollection;

let invoiceId: string;
const defaultContext: ConfirmPaidInvoiceContext = {
  roles: [Roles.SUPER_ADMIN]
};

describe('ConfirmPaidInvoiceUsecase', () => {
  describe('When NO Invoice ID is provided', () => {
    beforeEach(() => {
      mockInvoiceRepo = new MockInvoiceRepo();

      usecase = new ConfirmPaidInvoiceUsecase(mockInvoiceRepo);
    });

    it('should fail', async () => {
      // * act
      result = await usecase.execute({}, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Invoice ID is provided', () => {
    beforeEach(() => {
      mockInvoiceRepo = new MockInvoiceRepo();

      invoiceId = 'test-invoice';
      const invoice = Invoice.create(
        {
          transactionId: TransactionId.create(
            new UniqueEntityID('transaction-id')
          ),
          status: InvoiceStatus.DRAFT
        },
        new UniqueEntityID(invoiceId)
      ).getValue();
      mockInvoiceRepo.save(invoice);

      usecase = new ConfirmPaidInvoiceUsecase(mockInvoiceRepo);
    });

    describe('And Invoice ID is INVALID', () => {
      it('should fail', async () => {
        result = await usecase.execute({invoiceId: null}, defaultContext);
        expect(result.isFailure).toBeTruthy();
      });
    });

    describe('And Invoice ID is VALID', () => {
      it('should mark invoice as paid', async () => {
        // arrange
        invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
        expect(invoiceCollection.length).toEqual(1);

        result = await usecase.execute({invoiceId}, defaultContext);

        expect(result.isSuccess).toBeTruthy();
        expect(
          result.getValue().invoiceId.id.toString() === invoiceId
        ).toBeTruthy();
        expect(result.getValue().status === InvoiceStatus.FINAL).toBeTruthy();
      });
    });
  });
});
