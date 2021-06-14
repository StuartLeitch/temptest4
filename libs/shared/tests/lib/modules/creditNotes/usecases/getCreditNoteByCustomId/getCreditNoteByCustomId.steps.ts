import { Before, After, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../../shared/src/lib/domain/authorization';

import { CreditNote } from '../../../../../../src/lib/modules/creditNotes/domain/CreditNote';
import { CreditNoteMap } from '../../../../../../src/lib/modules/creditNotes/mappers/CreditNoteMap';
import { MockCreditNoteRepo } from '../../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';
import { GetCreditNoteByCustomIdUsecase } from '../../../../../../src/lib/modules/creditNotes/usecases/getCreditNoteByCustomId/getCreditNoteByCustomId';

import {
  InvoiceItemMap,
  ArticleMap,
  InvoiceMap,
  MockInvoiceRepo,
  MockInvoiceItemRepo,
  MockArticleRepo,
} from '../../../../../../src';

function makeCreditNoteData(overwrites?: any): CreditNote {
  return CreditNoteMap.toDomain({
    dateCreated: new Date(),
    vat: 20,
    price: -2000,
    ...overwrites,
  });
}

const testManuscriptCustomId = '88888';
const testInvoiceId = 'test-invoice';

let mockCreditNoteRepo: MockCreditNoteRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockArticleRepo: MockArticleRepo;
let usecase: GetCreditNoteByCustomIdUsecase;
let creditNote: CreditNote;
let result: any;

Before({ tags: '@ValidateGetCreditNoteByCustomIdUsecase' }, async () => {
  mockCreditNoteRepo = new MockCreditNoteRepo();
  mockInvoiceRepo = new MockInvoiceRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockArticleRepo = new MockArticleRepo();
  usecase = new GetCreditNoteByCustomIdUsecase(mockCreditNoteRepo);
});

After({ tags: '@ValidateGetCreditNoteByCustomIdUsecase' }, () => {
  mockCreditNoteRepo = null;
  mockInvoiceRepo = null;
  mockInvoiceItemRepo = null;
  mockArticleRepo = null;
});

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

Given(
  /^an article with the custom id "([\w-]+)"/,
  async (testCustomId: string) => {
    const invoice = InvoiceMap.toDomain({
      transactionId: 'transaction-id',
      dateCreated: new Date(),
      id: testInvoiceId,
      status: 'ACTIVE',
    });
    const invoiceItem = InvoiceItemMap.toDomain({
      invoiceId: testInvoiceId,
      manuscriptId: testManuscriptCustomId,
      price: 1000,
    });
    const article = ArticleMap.toDomain({
      id: testManuscriptCustomId,
      customId: testCustomId,
    });

    creditNote = makeCreditNoteData(testInvoiceId);

    await mockInvoiceRepo.save(invoice);
    await mockInvoiceItemRepo.save(invoiceItem);
    await mockArticleRepo.save(article);
    creditNote = await mockCreditNoteRepo.save(creditNote);
  }
);

When(
  /^we execute GetCreditNoteByCustomIdUsecase with custom id "([\w-]+)"/,
  async (testCustomId: string) => {
    result = await usecase.execute({ customId: testCustomId }, defaultContext);
  }
);

Then(
  /^I should receive the credit note for "([\w-]+)"/,
  (testCustomId: string) => {
    expect(result.value.isSuccess).to.equal(true);
  }
);
