// import {Result} from '../../../../core/logic/Result';
// import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockWaiverRepo} from './../../../../domain/reductions/repos/mocks/mockWaiverRepo';
import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {InvoiceCollection, InvoiceStatus} from '../../domain/Invoice';
import {InvoiceMap} from './../../mappers/InvoiceMap';

import {
  GetInvoiceDetailsUsecase,
  GetInvoiceDetailsContext
} from './getInvoiceDetails';
// import {GetInvoiceDetailsResponse} from './getInvoiceDetailsResponse';

let usecase: GetInvoiceDetailsUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let mockWaiverRepo: MockWaiverRepo;
let result: any;

let invoiceCollection: InvoiceCollection;
let invoiceId: string;

const defaultContext: GetInvoiceDetailsContext = {roles: [Roles.SUPER_ADMIN]};

describe('GetInvoiceDetailsUsecase', () => {
  // describe('When NO Invoice ID is provided', () => {
  //   beforeEach(() => {
  //     mockInvoiceRepo = new MockInvoiceRepo();

  //     usecase = new GetInvoiceDetailsUsecase(mockInvoiceRepo);
  //   });

  //   it('should fail', async () => {
  //     // * act
  //     result = await usecase.execute({invoiceId: undefined}, defaultContext);

  //     expect(result.isFailure).toBeTruthy();
  //   });
  // });

  describe('When Invoice ID is provided', () => {
    beforeEach(() => {
      mockInvoiceRepo = new MockInvoiceRepo();
      mockWaiverRepo = new MockWaiverRepo();

      invoiceId = 'test-invoice';
      const invoice = InvoiceMap.toDomain({
        id: invoiceId,
        transactionId: 'transaction-2',
        status: InvoiceStatus.DRAFT
      });
      mockInvoiceRepo.save(invoice);

      usecase = new GetInvoiceDetailsUsecase(mockInvoiceRepo, mockWaiverRepo);
    });

    // describe('And Invoice ID is INVALID', () => {
    //   it('should fail', async () => {
    //     result = await usecase.execute(
    //       {
    //         invoiceId: null
    //       },
    //       defaultContext
    //     );
    //     expect(result.isFailure).toBeTruthy();
    //   });
    // });

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
        // expect(
        //   result.getValue().invoiceId.id.toString() === invoiceId
        // ).toBeTruthy();
      });
    });
  });
});
