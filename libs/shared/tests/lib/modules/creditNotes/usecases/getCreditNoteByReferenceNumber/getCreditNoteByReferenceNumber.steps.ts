import { expect } from 'chai';
import { Before, After, Given, When, Then } from '@cucumber/cucumber';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../../shared/src/lib/domain/authorization';

import { CreditNote } from '../../../../../../src/lib/modules/creditNotes/domain/CreditNote';
import { CreditNoteMap } from '../../../../../../src/lib/modules/creditNotes/mappers/CreditNoteMap';
import { MockCreditNoteRepo } from '../../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';
import { GetCreditNoteByReferenceNumberUsecase } from '../../../../../../src/lib/modules/creditNotes/usecases/getCreditNoteByReferenceNumber/getCreditNoteByReferenceNumber';

function makeCreditNoteData(overwrites?: any): CreditNote {
  const maybeCreditNote = CreditNoteMap.toDomain({
    dateCreated: new Date(),
    vat: 20,
    price: -2000,
    ...overwrites,
  });

  if (maybeCreditNote.isLeft()) {
    throw maybeCreditNote.value;
  }

  return maybeCreditNote.value;
}

let mockCreditNoteRepo: MockCreditNoteRepo;
let creditNote: CreditNote;
let usecase: GetCreditNoteByReferenceNumberUsecase;
let result: any;

Before({ tags: '@ValidateGetCreditNoteByReferenceNumberUsecase' }, async () => {
  mockCreditNoteRepo = new MockCreditNoteRepo();
  usecase = new GetCreditNoteByReferenceNumberUsecase(mockCreditNoteRepo);
});

After({ tags: '@ValidateGetCreditNoteByReferenceNumberUsecase' }, () => {
  mockCreditNoteRepo = null;
  usecase = null;
});

Given(
  /^the credit note with id "([\w-]+)" and reference number "([\w-]+)"/,
  async (creditNoteId: string, testNumber: string) => {
    creditNote = makeCreditNoteData({
      id: creditNoteId,
      persistentReferenceNumber: testNumber,
    });

    const maybeCreditNote = await mockCreditNoteRepo.save(creditNote);

    if (maybeCreditNote.isLeft()) {
      throw maybeCreditNote.value;
    }

    creditNote = maybeCreditNote.value;
  }
);

When(
  /^I execute GetCreditNoteByReferenceNumberUsecase with "([\w-]+)"/,
  async (testNumber: string) => {
    result = await usecase.execute({ referenceNumber: testNumber });
  }
);

Then('I should get the credit note', async () => {
  expect(result.isRight()).to.be.true;
});

When(
  /^I execute GetCreditNoteByReferenceNumberUsecase with unexistent ref no "([\w-]+)"/,
  async (wrongNumber: string) => {
    result = await usecase.execute({ referenceNumber: wrongNumber });
  }
);

Then('I should not get the credit note', async () => {
  expect(result.value.getValue()).to.be.null;
});
