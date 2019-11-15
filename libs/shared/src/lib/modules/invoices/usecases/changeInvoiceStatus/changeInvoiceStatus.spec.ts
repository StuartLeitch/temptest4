import {Invoice} from '../../domain/Invoice';
import {ChangeInvoiceStatus} from './changeInvoiceStatus';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';

class MockRepo implements InvoiceRepoContract {
  getInvoiceById(
    invoiceId: import('../../domain/InvoiceId').InvoiceId
  ): Promise<Invoice> {
    throw new Error('Method not implemented.');
  }
  getInvoiceByInvoiceItemId(
    invoiceItemId: import('../../domain/InvoiceItemId').InvoiceItemId
  ): Promise<Invoice> {
    throw new Error('Method not implemented.');
  }
  getInvoicesByTransactionId(
    transactionId: import('../../../../..').TransactionId
  ): Promise<Invoice[]> {
    throw new Error('Method not implemented.');
  }
  delete(invoice: Invoice): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  update(invoice: Invoice): Promise<Invoice> {
    throw new Error('Method not implemented.');
  }
  exists(t: Invoice): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  save(t: Invoice): Promise<Invoice> {
    throw new Error('Method not implemented.');
  }
}

const invoiceRepo = new MockRepo();

invoiceRepo.getInvoiceById = jest.fn().mockReturnValue({status: ''});
invoiceRepo.update = jest.fn(i => Promise.resolve(i as Invoice));

describe('ChangeInvoiceStatusUseCase', () => {
  it('Changes the status of an invoice', async () => {
    const usecase = new ChangeInvoiceStatus(invoiceRepo);

    const result = await usecase.execute({invoiceId: '123', status: 'ACTIVE'});

    expect(invoiceRepo.getInvoiceById).toHaveBeenCalledTimes(1);
    expect(invoiceRepo.update).toHaveBeenCalledTimes(1);
    expect((result.value.getValue() as Invoice).status).toEqual('ACTIVE');
  });
});
