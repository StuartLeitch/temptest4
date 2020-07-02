import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { Result } from './../../../../../src/lib/core/logic/Result';
import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { Journal } from './../../../../../src/lib/modules/journals/domain/Journal';
import { Email } from '../../../../../src/lib/domain/Email';
import { Name } from '../../../../../src/lib/domain/Name';

let journalOrError: Result<Journal>;

Before(function() {
  journalOrError = null;
})

Given('There is a Journal Domain Entity', function() {
  return;
});

When('I try to create a Journal called {string} with an articleProcessingCharge equal to {int}', function(
  journalName: string,
  articleProcessingCharge: number
) {
  const journalId = new UniqueEntityID();

  journalOrError = Journal.create({
    name: Name.create({value: journalName}).getValue(),
    email: Email.create({value: 'journal-email@mail.com'}).getValue(),
    articleProcessingCharge: articleProcessingCharge,
    code: 'journal-code',
    issn: 'journal-issn',
    isActive: false
  }, journalId);
});

Then('A new Journal called {string} with an articleProcessingCharge equal to {int} is created', function(
  journalName: string,
  articleProcessingCharge: number
){
  expect(journalOrError.isSuccess).to.equal(true);

  const journal = journalOrError.getValue();
  expect(journal.name.value).to.equal(journalName);
  expect(journal.articleProcessingCharge).to.equal(articleProcessingCharge);
});
