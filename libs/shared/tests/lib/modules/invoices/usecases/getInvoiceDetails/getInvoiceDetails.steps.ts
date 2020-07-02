import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';

import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import {
  InvoiceCollection,
  InvoiceStatus,
} from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

import {
  GetInvoiceDetailsUsecase,
  GetInvoiceDetailsContext,
} from '../../../../../../src/lib/modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails';

const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
const usecase: GetInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(
  mockInvoiceRepo
);
let result: any;

let invoiceCollection: InvoiceCollection;

const defaultContext: GetInvoiceDetailsContext = { roles: [Roles.SUPER_ADMIN] };

Given(/^A invoice with the id "([\w-]+)"$/, (invoiceId: string) => {
  const invoice = InvoiceMap.toDomain({
    id: invoiceId,
    transactionId: 'transaction-2',
    status: InvoiceStatus.DRAFT,
  });
  mockInvoiceRepo.save(invoice);
});

When(
  /^GetInvoiceDetailsUsecase is executed for invoice "([\w-]+)"$/,
  async (invoiceId: string) => {
    invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
    expect(invoiceCollection.length).to.equal(1);
    result = await usecase.execute(
      {
        invoiceId,
      },
      defaultContext
    );
  }
);

Then('the details of the invoice will be returned', async () => {
  expect(result.value.isSuccess).to.equal(true);
});
