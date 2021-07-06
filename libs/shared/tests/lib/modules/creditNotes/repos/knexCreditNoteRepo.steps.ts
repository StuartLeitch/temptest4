import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { Either } from '../../../../../src/lib/core/logic/Either';
import { GuardFailure } from '../../../../../src/lib/core/logic/GuardFailure';
import { RepoError } from '../../../../../src/lib/infrastructure/RepoError';

import { InvoiceId } from '../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { CreditNoteId } from '../../../../../src/lib/modules/creditNotes/domain/CreditNoteId';
import { CreditNote } from '../../../../../src/lib/modules/creditNotes/domain/CreditNote';
import { CreditNoteMap } from '../../../../../src/lib/modules/creditNotes/mappers/CreditNoteMap';
import { MockCreditNoteRepo } from '../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';

function makeCreditNoteData(overwrites?: any): CreditNote {
  const creditNote = CreditNoteMap.toDomain({
    dateCreated: new Date(),
    vat: 20,
    price: -2000,
    ...overwrites,
  });

  if (creditNote.isLeft()) {
    throw creditNote.value;
  }

  return creditNote.value;
}

let mockCreditNoteRepo: MockCreditNoteRepo;
let creditNote: CreditNote;
let foundCreditNote: CreditNote;
let creditNoteExists: boolean;
let saveCreditNote: CreditNote;

Before({ tags: '@ValidateKnexCreditNoteRepo' }, async () => {
  mockCreditNoteRepo = new MockCreditNoteRepo();
});

After({ tags: '@ValidateKnexCreditNoteRepo' }, () => {
  mockCreditNoteRepo = null;
});

Given(
  /^a credit note with invoiceId "([\w-]+)" and id "([\w-]+)"$/,
  async (invoiceId: string, creditNoteId: string) => {
    creditNote = makeCreditNoteData({ invoiceId, id: creditNoteId });
    const maybeCreditNote = await mockCreditNoteRepo.save(creditNote);

    if (maybeCreditNote.isLeft()) {
      throw maybeCreditNote.value;
    }

    creditNote = maybeCreditNote.value;
  }
);

When(
  /^we call getCreditNoteByInvoiceId for "([\w-]+)"$/,
  async (invoiceId: string) => {
    const invoiceIdObj = InvoiceId.create(new UniqueEntityID(invoiceId));
    const maybeFoundCreditNote = await mockCreditNoteRepo.getCreditNoteByInvoiceId(
      invoiceIdObj
    );

    if (maybeFoundCreditNote.isLeft()) {
      throw maybeFoundCreditNote.value;
    }

    foundCreditNote = maybeFoundCreditNote.value;
  }
);

Then('getCreditNoteByInvoiceId returns the credit note', async () => {
  expect(foundCreditNote.invoiceId.id.toValue()).to.equal(
    creditNote.invoiceId.id.toValue()
  );
});

When(
  /^we call getCreditNoteByInvoiceId for un-existent credit note "([\w-]+)"$/,
  async (wrongId: string) => {
    const invoiceId = InvoiceId.create(new UniqueEntityID(wrongId));
    const maybeFoundCreditNote = await mockCreditNoteRepo.getCreditNoteByInvoiceId(
      invoiceId
    );
    if (maybeFoundCreditNote.isRight()) {
      foundCreditNote = maybeFoundCreditNote.value;
    }
  }
);

Then('getCreditNoteByInvoiceId returns null', async () => {
  expect(foundCreditNote).to.equal(null);
});

When(
  /^we call getCreditNoteById for "([\w-]+)"$/,
  async (creditNoteId: string) => {
    const creditNoteIdObj = CreditNoteId.create(
      new UniqueEntityID(creditNoteId)
    );
    const maybeFoundCreditNote = await mockCreditNoteRepo.getCreditNoteById(
      creditNoteIdObj
    );

    if (maybeFoundCreditNote.isLeft()) {
      throw maybeFoundCreditNote.value;
    }

    foundCreditNote = maybeFoundCreditNote.value;
  }
);

Then('getCreditNoteById returns the credit note', async () => {
  expect(foundCreditNote.id.toValue()).to.equal(creditNote.id.toValue());
});

When(
  /^we call getCreditNoteById for un-existent credit note "([\w-]+)"$/,
  async (wrongCreditNoteId: string) => {
    const id = CreditNoteId.create(new UniqueEntityID(wrongCreditNoteId));

    const maybeFoundCreditNote = await mockCreditNoteRepo.getCreditNoteById(id);

    if (maybeFoundCreditNote.isRight()) {
      foundCreditNote = maybeFoundCreditNote.value;
    }
  }
);

Then('getCreditNoteById returns null', async () => {
  expect(foundCreditNote).to.equal(null);
});

When(/^we call update for credit note "([\w-]+)"$/, async (id: string) => {
  const creditNoteIdObj = CreditNoteId.create(new UniqueEntityID(id));
  const maybeFoundCreditNote = await mockCreditNoteRepo.getCreditNoteById(
    creditNoteIdObj
  );
  if (maybeFoundCreditNote.isLeft()) {
    throw maybeFoundCreditNote.value;
  }

  foundCreditNote = maybeFoundCreditNote.value;
  const price = -400;
  foundCreditNote.price = price;
  await mockCreditNoteRepo.update(foundCreditNote);
});

Then(/^update modifies the credit note "([\w-]+)"$/, async (id: string) => {
  const creditNoteIdObj = CreditNoteId.create(new UniqueEntityID(id));
  const maybeFoundCreditNote = await mockCreditNoteRepo.getCreditNoteById(
    creditNoteIdObj
  );
  if (maybeFoundCreditNote.isLeft()) {
    throw maybeFoundCreditNote.value;
  }

  foundCreditNote = maybeFoundCreditNote.value;
  expect(foundCreditNote.price).to.equal(-400);
});

When(/^we call exists for ([\w-]+) credit note id$/, async (id: string) => {
  const creditNoteIdObj = CreditNoteId.create(new UniqueEntityID(id));
  const maybeFoundCreditNote = await mockCreditNoteRepo.getCreditNoteById(
    creditNoteIdObj
  );

  if (maybeFoundCreditNote.isLeft()) {
    throw maybeFoundCreditNote.value;
  }
  foundCreditNote = maybeFoundCreditNote.value;

  if (!foundCreditNote) {
    foundCreditNote = makeCreditNoteData({ id });
  }

  const maybeCreditNoteExists = await mockCreditNoteRepo.exists(
    foundCreditNote
  );

  if (maybeCreditNoteExists.isLeft()) {
    throw maybeCreditNoteExists.value;
  }

  creditNoteExists = maybeCreditNoteExists.value;
});

Then(/^CreditNote.exists returns (.*)$/, async (exists: string) => {
  expect(String(creditNoteExists)).to.equal(exists);
});

Given(
  /^a credit note object with id "([\w-]+)"$/,
  async (creditNoteId: string) => {
    creditNote = makeCreditNoteData({ id: creditNoteId });
  }
);

When('we call CreditNote.save on the credit note object', async () => {
  const maybeSaveCreditNote = await mockCreditNoteRepo.save(creditNote);
  if (maybeSaveCreditNote.isLeft()) {
    throw maybeSaveCreditNote.value;
  }
  saveCreditNote = maybeSaveCreditNote.value;
});

Then('the credit note object should be saved', async () => {
  expect(saveCreditNote.id.toValue()).to.equal(creditNote.id.toValue());
});
