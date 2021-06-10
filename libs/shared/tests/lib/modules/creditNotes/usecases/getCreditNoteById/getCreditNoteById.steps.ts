import { expect } from 'chai';
import { Before, After, Given, When, Then } from '@cucumber/cucumber';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../../shared/src/lib/domain/authorization';

import { CreditNote } from '../../../../../../src/lib/modules/creditNotes/domain/CreditNote';
import { CreditNoteMap } from '../../../../../../src/lib/modules/creditNotes/mappers/CreditNoteMap';
import { MockCreditNoteRepo } from '../../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';
import { GetCreditNoteByIdUsecase } from '../../../../../../src/lib/modules/creditNotes/usecases/getCreditNoteById/getCreditNoteById';

function makeCreditNoteData(overwrites?: any): CreditNote {
  return CreditNoteMap.toDomain({
    dateCreated: new Date(),
    vat: 20,
    price: -2000,
    ...overwrites,
  });
}

let mockCreditNoteRepo: MockCreditNoteRepo;
let usecase: GetCreditNoteByIdUsecase;
let creditNote: CreditNote;
let result: any;

Before({ tags: '@ValidateGetCreditNoteByIdUsecase' }, async () => {
  mockCreditNoteRepo = new MockCreditNoteRepo();
  usecase = new GetCreditNoteByIdUsecase(mockCreditNoteRepo);
});

After({ tags: '@ValidateGetCreditNoteByIdUsecase' }, () => {
  mockCreditNoteRepo = null;
  usecase = null;
});

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

Given(/^a credit note with the id "([\w-]+)"/, async (creditNoteId: string) => {
  creditNote = makeCreditNoteData(creditNoteId);
  creditNote = await mockCreditNoteRepo.save(creditNote);
});

When(
  /^GetCreditNoteByIdUsecase is executed for credit note "([\w-]+)"/,
  async (creditNoteId: string) => {
    result = await usecase.execute({ creditNoteId });
  }
);

Then(/^the credit note will be returned/, () => {
  expect(result.value.isSuccess).to.equal(true);
});
