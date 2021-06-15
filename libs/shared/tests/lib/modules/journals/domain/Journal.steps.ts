import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { GuardFailure } from './../../../../../src/lib/core/logic/GuardFailure';
import { UseCaseError } from './../../../../../src/lib/core/logic/UseCaseError';
import { Either } from './../../../../../src/lib/core/logic/Either';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { Journal } from './../../../../../src/lib/modules/journals/domain/Journal';
import { Email } from '../../../../../src/lib/domain/Email';
import { Name } from '../../../../../src/lib/domain/Name';

let maybeJournal: Either<GuardFailure | UseCaseError, Journal>;

Before({ tags: '@ValidateJournal' }, function () {
  maybeJournal = null;
});

Given('There is a Journal Domain Entity', function () {
  return;
});

When(
  'I try to create a Journal called {string} with an articleProcessingCharge equal to {int}',
  function (journalName: string, articleProcessingCharge: number) {
    const journalId = new UniqueEntityID();

    const maybeName = Name.create({ value: journalName });

    if (maybeName.isLeft()) {
      throw maybeName.value;
    }

    const maybeEmail = Email.create({ value: 'journal-email@mail.com' });

    if (maybeEmail.isLeft()) {
      throw maybeEmail.value;
    }

    maybeJournal = Journal.create(
      {
        name: maybeName.value,
        email: maybeEmail.value,
        articleProcessingCharge: articleProcessingCharge,
        code: 'journal-code',
        issn: 'journal-issn',
        isActive: false,
      },
      journalId
    );
  }
);

Then(
  'A new Journal called {string} with an articleProcessingCharge equal to {int} is created',
  function (journalName: string, articleProcessingCharge: number) {
    expect(maybeJournal.isRight()).to.equal(true);

    if (maybeJournal.isLeft()) {
      throw maybeJournal.value;
    }

    const journal = maybeJournal.value;
    expect(journal.name.value).to.equal(journalName);
    expect(journal.articleProcessingCharge).to.equal(articleProcessingCharge);
  }
);
