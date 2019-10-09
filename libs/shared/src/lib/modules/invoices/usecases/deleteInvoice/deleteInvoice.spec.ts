import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Roles} from '../../../users/domain/enums/Roles';

import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {Invoice, InvoiceCollection, InvoiceStatus} from '../../domain/Invoice';
import {DeleteInvoiceUsecase, DeleteInvoiceContext} from './deleteInvoice';

let usecase: DeleteInvoiceUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let result: Result<Invoice | unknown>;

let invoiceCollection: InvoiceCollection;

let invoiceId;

const defaultContext: DeleteInvoiceContext = {roles: [Roles.SUPER_ADMIN]};

describe('DeleteInvoiceUsecase', () => {
  beforeEach(() => {
    mockInvoiceRepo = new MockInvoiceRepo();
    invoiceId = 'test-invoice';
    const invoice = Invoice.create(
      {
        status: InvoiceStatus.DRAFT
      },
      new UniqueEntityID(invoiceId)
    ).getValue();
    mockInvoiceRepo.save(invoice);
    usecase = new DeleteInvoiceUsecase(mockInvoiceRepo);
  });

  describe('When NO Invoice ID is provided', () => {
    it('should return an error', async () => {
      result = await usecase.execute({invoiceId: null}, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Invoice ID is provided', () => {
    it.only('should simply flag it as deleted', async () => {
      // * arrange
      invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
      expect(invoiceCollection.length).toEqual(1);

      result = await usecase.execute({invoiceId}, defaultContext);

      expect(result.isSuccess).toBeTruthy();
    });
  });
});
