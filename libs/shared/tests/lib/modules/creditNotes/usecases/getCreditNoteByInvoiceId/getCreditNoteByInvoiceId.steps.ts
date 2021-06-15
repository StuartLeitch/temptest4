import { expect } from 'chai';
import { Before, After, Given, When, Then } from '@cucumber/cucumber';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../../shared/src/lib/domain/authorization';

import { CreditNote } from '../../../../../../src/lib/modules/creditNotes/domain/CreditNote';
import { CreditNoteMap } from '../../../../../../src/lib/modules/creditNotes/mappers/CreditNoteMap';
import { MockCreditNoteRepo } from '../../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';
import { GetCreditNoteByInvoiceIdUsecase } from '../../../../../../src/lib/modules/creditNotes/usecases/getCreditNoteByInvoiceId/getCreditNoteByInvoiceId';

function makeCreditNoteData(overwrites?: any): CreditNote {
  return CreditNoteMap.toDomain({
    dateCreated: new Date(),
    vat: 20,
    price: -2000,
    ...overwrites,
  });
}

let mockCreditNoteRepo: MockCreditNoteRepo;
let usecase: GetCreditNoteByInvoiceIdUsecase;
let creditNote: CreditNote;
let result: any;

Before({ tags: '@ValidateGetCreditNoteByInvoiceIdUsecase' }, async () => {
  mockCreditNoteRepo = new MockCreditNoteRepo();
  usecase = new GetCreditNoteByInvoiceIdUsecase(mockCreditNoteRepo);
});

After({ tags: '@ValidateGetCreditNoteByInvoiceIdUsecase' }, () => {
  mockCreditNoteRepo = null;
  usecase = null;
});

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

Given(
  /^the credit note with an invoice id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    creditNote = makeCreditNoteData({ invoiceId: testInvoiceId });
    creditNote = await mockCreditNoteRepo.save(creditNote);
  }
);

When(
  /^we call GetCreditNoteByInvoiceIdUsecase with invoice id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    result = await usecase.execute(
      { invoiceId: testInvoiceId },
      defaultContext
    );
  }
);

Then(/^the credit note is returned/, async () => {
  expect(result.value.isSuccess).to.equal(true);
});
