import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { Result } from './../../../../../src/lib/core/logic/Result';
import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { Article } from './../../../../../src/lib/modules/manuscripts/domain/Article';

let articleOrError: Result<Article>;
let article;

Before(function () {
  articleOrError = null;
});

Given('There is an Article Domain Entity', function () {
  return;
});

When(
  /^The Article.create method is called for a given ID "([\w-]+)"$/,
  function (testArticleId: string) {
    const articleId = new UniqueEntityID(testArticleId);
    articleOrError = Article.create({ customId: 'custom-id' }, articleId);
  }
);

When(
  /^I try to mark as published an article with ID "([\w-]+)" on "([\w-]+)"$/,
  function (testArticleId: string, datePublished: string) {
    const articleId = new UniqueEntityID(testArticleId);
    article = Article.create({ customId: 'custom-id' }, articleId).getValue();

    article.markAsPublished(datePublished);
  }
);

Then(/^A new Article is successfully created with ID "([\w-]+)"$/, function (
  testArticleId: string
) {
  expect(articleOrError.isSuccess).to.equal(true);
  article = articleOrError.getValue();
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
