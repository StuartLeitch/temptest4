import { expect } from 'chai';
import { Given, Then, Before, When, After } from '@cucumber/cucumber';

import { GetRecentCreditNotesUesecase } from '../../../../../../src/lib/modules/creditNotes/usecases/getRecentCreditNotes/getRecentCreditNotes';
import { GetRecentCreditNotesResponse } from '../../../../../../src/lib/modules/creditNotes/usecases/getRecentCreditNotes/getRecentCreditNotesResponse';

import { CreditNote } from '../../../../../../src/lib/modules/creditNotes/domain/CreditNote';
import { MockCreditNoteRepo } from '../../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';
import { CreditNoteMap } from '../../../../../../src/lib/modules/creditNotes/mappers/CreditNoteMap';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';

function makeCreditNoteData(overwrites?: any): CreditNote {
  return CreditNoteMap.toDomain({
    dateCreated: new Date(),
    vat: 20,
    price: -2000,
    ...overwrites,
  });
}

let mockCreditNoteRepo: MockCreditNoteRepo;
let usecase: GetRecentCreditNotesUesecase;
let creditNote: CreditNote;
let result: GetRecentCreditNotesResponse;

Before({ tags: '@ValidateGetRecentCreditNotesUsecase' }, async () => {
  mockCreditNoteRepo = new MockCreditNoteRepo();
  usecase = new GetRecentCreditNotesUesecase(mockCreditNoteRepo);
});

After({ tags: '@ValidateGetRecentCreditNotesUsecase' }, () => {
  mockCreditNoteRepo = null;
  usecase = null;
});

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

Given(
  /^I added the credit note "([\w-]+)" with invoice id "([\w-]+)"/,
  async (testCreditNoteId: string, testInvoiceId: string) => {
    creditNote = makeCreditNoteData({
      id: testCreditNoteId,
      invoiceId: testInvoiceId,
    });
    creditNote = await mockCreditNoteRepo.save(creditNote);
  }
);

Given(/^I have no added credit notes/, () => {});

When(/^I execute ValidateGetRecentCreditNotesUsecase/, async () => {
  result = await usecase.execute({}, defaultContext);
});

Then(/^I should receive the added credit note/, () => {
  expect(result.isRight()).to.be.true;
  expect(result.value.getValue()).to.have.property('totalCount').to.equal(1);
});

Then(/^I should not receive any credit note/, () => {
  expect(result.isRight()).to.be.true;
  expect(result.value.getValue()).to.have.property('totalCount').to.equal(0);
});
