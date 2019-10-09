import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {
  Invoice,
  InvoiceCollection,
  STATUS as InvoiceStatus
} from '../../domain/Invoice';
import {
  GetInvoiceDetailsUsecase,
  GetInvoiceDetailsContext
} from './getInvoiceDetails';

let usecase: GetInvoiceDetailsUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let result: Result<Invoice>;

let invoiceCollection: InvoiceCollection;
let invoiceId: string;

const defaultContext: GetInvoiceDetailsContext = {roles: [Roles.SUPER_ADMIN]};

describe('GetInvoiceDetailsUsecase', () => {
  describe('When NO Invoice ID is provided', () => {
    beforeEach(() => {
      mockInvoiceRepo = new MockInvoiceRepo();

      usecase = new GetInvoiceDetailsUsecase(mockInvoiceRepo);
    });

    it('should fail', async () => {
      // * act
      result = await usecase.execute({}, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Invoice ID is provided', () => {
    beforeEach(() => {
      // mockTransactionRepo = new MockTransactionRepo();
      mockInvoiceRepo = new MockInvoiceRepo();

      invoiceId = 'test-invoice';
      const invoice = Invoice.create(
        {
          status: InvoiceStatus.DRAFT
        },
        new UniqueEntityID(invoiceId)
      ).getValue();
      mockInvoiceRepo.save(invoice);

      usecase = new GetInvoiceDetailsUsecase(mockInvoiceRepo);
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
      it('should return the invoice details', async () => {
        // arrange
        invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
        expect(invoiceCollection.length).toEqual(1);

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
  });
});
