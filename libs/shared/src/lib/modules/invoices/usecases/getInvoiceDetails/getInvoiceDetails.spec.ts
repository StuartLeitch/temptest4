import {Roles} from '../../../users/domain/enums/Roles';

import {WaiverService} from './../../../../domain/services/WaiverService';
import {VATService} from './../../../../domain/services/VATService';
import {MockWaiverRepo} from './../../../../domain/reductions/repos/mocks/mockWaiverRepo';
import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {InvoiceCollection, InvoiceStatus} from '../../domain/Invoice';
import {InvoiceMap} from './../../mappers/InvoiceMap';

import {
  GetInvoiceDetailsUsecase,
  GetInvoiceDetailsContext
} from './getInvoiceDetails';

let usecase: GetInvoiceDetailsUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let mockWaiverRepo: MockWaiverRepo;
let vatService: VATService;
let waiverService: WaiverService;
let result: any;

let invoiceCollection: InvoiceCollection;
let invoiceId: string;

const defaultContext: GetInvoiceDetailsContext = {roles: [Roles.SUPER_ADMIN]};

describe('GetInvoiceDetailsUsecase', () => {
  describe('When Invoice ID is provided', () => {
    beforeEach(() => {
      mockInvoiceRepo = new MockInvoiceRepo();
      mockWaiverRepo = new MockWaiverRepo();
      vatService = new VATService();
      waiverService = new WaiverService();

      invoiceId = 'test-invoice';
      const invoice = InvoiceMap.toDomain({
        id: invoiceId,
        transactionId: 'transaction-2',
        status: InvoiceStatus.DRAFT
      });
      mockInvoiceRepo.save(invoice);

      usecase = new GetInvoiceDetailsUsecase(mockInvoiceRepo);
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

        expect(result.value.isSuccess).toBe(true);
      });
    });
  });
});
