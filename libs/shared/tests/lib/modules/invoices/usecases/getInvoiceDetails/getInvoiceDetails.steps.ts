import { expect } from 'chai';
import { Given, When, Then } from '@cucumber/cucumber';

import {
  UsecaseAuthorizationContext,
  Roles,
} from '../../../../../../src/lib/domain/authorization';
import { UseCaseError } from '../../../../../../src/lib/core/logic/UseCaseError';
import { Either } from '../../../../../../src/lib/core/logic/Either';

import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';

import {
  InvoiceCollection,
  InvoiceStatus,
  Invoice,
} from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

import { GetInvoiceDetailsUsecase } from '../../../../../../src/lib/modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails';

const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
const usecase: GetInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(
  mockInvoiceRepo
);
let result: Either<UseCaseError, Invoice>;

let invoiceCollection: InvoiceCollection;

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.PAYER],
};

Given(/^A invoice with the id "([\w-]+)"$/, (invoiceId: string) => {
  const invoice = InvoiceMap.toDomain({
    id: invoiceId,
    transactionId: 'transaction-2',
    status: InvoiceStatus.DRAFT,
  });

  if (invoice.isLeft()) {
    throw invoice.value;
  }

  mockInvoiceRepo.save(invoice.value);
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
  expect(result.isRight()).to.equal(true);
});
