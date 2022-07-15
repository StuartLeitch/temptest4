import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { GuardFailure } from './../../../../../src/lib/core/logic/GuardFailure';
import { UseCaseError } from './../../../../../src/lib/core/logic/UseCaseError';
import { Either } from './../../../../../src/lib/core/logic/Either';

import { Article } from './../../../../../src/lib/modules/manuscripts/domain/Article';

let maybeArticle: Either<GuardFailure | UseCaseError, Article>;
let article: Article;

Before({ tags: '@ValidateArticle' }, function () {
  maybeArticle = null;
});

Given('There is an Article Domain Entity', function () {
  return;
});

When(/^The Article.create method is called for a given ID "([\w-]+)"$/, function (testArticleId: string) {
  const articleId = new UniqueEntityID(testArticleId);
  maybeArticle = Article.create({ customId: 'custom-id', taEligible: false, taFundingApproved: null }, articleId);
});

When(
  /^I try to mark as published an article with ID "([\w-]+)" on "([\w-]+)"$/,
  function (testArticleId: string, datePublished: string) {
    const articleId = new UniqueEntityID(testArticleId);
    const maybeArticle = Article.create(
      { customId: 'custom-id', taEligible: false, taFundingApproved: null },
      articleId
    );

    if (maybeArticle.isLeft()) {
      throw maybeArticle.value;
    }

    article.markAsPublished(datePublished);
  }
);

Then(/^A new Article is successfully created with ID "([\w-]+)"$/, function (testArticleId: string) {
  expect(maybeArticle.isRight()).to.equal(true);

  if (maybeArticle.isLeft()) {
    throw maybeArticle.value;
  }

  article = maybeArticle.value;
  expect(article.id.toValue()).to.equal(testArticleId);
});

Then(
  /^The published date for the Article with ID "([\w-]+)" is successfully updated to "([\w-]+)"$/,
  function (testArticleId: string, datePublished: string) {
    expect(article.id.toValue()).to.equal(testArticleId);

    const d1 = new Date(article.props.datePublished);
    const d2 = new Date(datePublished);

    const diff = d1.getTime() - d2.getTime();
    expect(diff).to.equal(0);
  }
);
