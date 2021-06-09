import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';

import { InvoiceId } from '../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { CreditNoteId } from '../../../../../src/lib/modules/creditNotes/domain/CreditNoteId';
import { CreditNote } from '../../../../../src/lib/modules/creditNotes/domain/CreditNote';
import { CreditNoteMap } from '../../../../../src/lib/modules/creditNotes/mappers/CreditNoteMap';
import { MockCreditNoteRepo } from '../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';

function makeCreditNoteData(overwrites?: any): CreditNote {
  return CreditNoteMap.toDomain({
    dateCreated: new Date(),
    vat: 20,
    price: -2000,
    ...overwrites,
  });
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
    creditNote = await mockCreditNoteRepo.save(creditNote);
  }
);

When(
  /^we call getCreditNoteByInvoiceId for "([\w-]+)"$/,
  async (invoiceId: string) => {
    const invoiceIdObj = InvoiceId.create(
      new UniqueEntityID(invoiceId)
    ).getValue();
    foundCreditNote = await mockCreditNoteRepo.getCreditNoteByInvoiceId(
      invoiceIdObj
    );
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
    const invoiceId = InvoiceId.create(new UniqueEntityID(wrongId)).getValue();
    foundCreditNote = await mockCreditNoteRepo.getCreditNoteByInvoiceId(
      invoiceId
    );
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
    ).getValue();
    foundCreditNote = await mockCreditNoteRepo.getCreditNoteById(
      creditNoteIdObj
    );
  }
);

Then('getCreditNoteById returns the credit note', async () => {
  expect(foundCreditNote.id.toValue()).to.equal(creditNote.id.toValue());
});

When(
  /^we call getCreditNoteById for un-existent credit note "([\w-]+)"$/,
  async (wrongCreditNoteId: string) => {
    const id = CreditNoteId.create(
      new UniqueEntityID(wrongCreditNoteId)
    ).getValue();
    try {
      foundCreditNote = await mockCreditNoteRepo.getCreditNoteById(id);
    } catch (err) {}
  }
);

Then('getCreditNoteById returns null', async () => {
  expect(foundCreditNote).to.equal(null);
});

When(/^we call update for credit note "([\w-]+)"$/, async (id: string) => {
  const creditNoteIdObj = CreditNoteId.create(
    new UniqueEntityID(id)
  ).getValue();
  foundCreditNote = await mockCreditNoteRepo.getCreditNoteById(creditNoteIdObj);
  const price = -400;
  foundCreditNote.price = price;
  await mockCreditNoteRepo.update(foundCreditNote);
});

Then(/^update modifies the credit note "([\w-]+)"$/, async (id: string) => {
  const creditNoteIdObj = CreditNoteId.create(
    new UniqueEntityID(id)
  ).getValue();
  foundCreditNote = await mockCreditNoteRepo.getCreditNoteById(creditNoteIdObj);
  expect(foundCreditNote.price).to.equal(-400);
});

When(/^we call exists for ([\w-]+) credit note id$/, async (id: string) => {
  const creditNoteIdObj = CreditNoteId.create(
    new UniqueEntityID(id)
  ).getValue();
  foundCreditNote = await mockCreditNoteRepo.getCreditNoteById(creditNoteIdObj);

  if (!foundCreditNote) {
    foundCreditNote = makeCreditNoteData({ id });
  }

  creditNoteExists = await mockCreditNoteRepo.exists(foundCreditNote);
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
  saveCreditNote = await mockCreditNoteRepo.save(creditNote);
});

Then('the credit note object should be saved', async () => {
  expect(saveCreditNote.id.toValue()).to.equal(creditNote.id.toValue());
});
