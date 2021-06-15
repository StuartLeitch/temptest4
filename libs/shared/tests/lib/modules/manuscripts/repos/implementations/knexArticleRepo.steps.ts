import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { Article } from '../../../../../../src/lib/modules/manuscripts/domain/Article';
import { Manuscript } from '../../../../../../src/lib/modules/manuscripts/domain/Manuscript';
import { ArticleId } from '../../../../../../src/lib/modules/manuscripts/domain/ArticleId';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

let mockArticleRepo: MockArticleRepo;
let article: Article;
let foundArticle: Article | Manuscript;
let articleExists: boolean;
let saveArticle: Article | Manuscript;

function makeArticleData(overwrites?: any): Article {
  const article = ArticleMap.toDomain({
    ...overwrites,
  });

  if (article.isLeft()) {
    throw article.value;
  }

  return article.value;
}

Before({ tags: '@ValidateKnexArticleRepo' }, async () => {
  mockArticleRepo = new MockArticleRepo();
});

Given(/^a article with the id "([\w-]+)"$/, async (articleId: string) => {
  article = makeArticleData({ id: articleId });
  await mockArticleRepo.save(article);
});

When(/^we call findById for "([\w-]+)"$/, async (articleId: string) => {
  const articleIdObj = ArticleId.create(new UniqueEntityID(articleId));
  const maybeFoundArticle = await mockArticleRepo.findById(articleIdObj);

  if (maybeFoundArticle.isLeft()) {
    throw maybeFoundArticle.value;
  }

  foundArticle = maybeFoundArticle.value;
});

Then('findById returns the article', async () => {
  expect(foundArticle).to.equal(article);
});

When(
  /^we call findById for an un-existent article "([\w-]+)"$/,
  async (wrongArticleId: string) => {
    const id = ArticleId.create(new UniqueEntityID(wrongArticleId));
    const maybeFoundArticle = await mockArticleRepo.findById(id);

    if (maybeFoundArticle.isLeft()) {
      throw maybeFoundArticle.value;
    }

    foundArticle = maybeFoundArticle.value;
  }
);

Then('findById returns null', async () => {
  expect(foundArticle).to.equal(null);
});

When(/^we call exists for ([\w-]+) article id$/, async (articleId: string) => {
  const id = ArticleId.create(new UniqueEntityID(articleId));
  const maybeFoundArticle = await mockArticleRepo.findById(id);

  if (maybeFoundArticle.isLeft()) {
    throw maybeFoundArticle.value;
  }

  foundArticle = maybeFoundArticle.value;

  if (!foundArticle) {
    foundArticle = makeArticleData({ id: articleId });
  }

  const maybeArticleExists = await mockArticleRepo.exists(foundArticle);

  if (maybeArticleExists.isLeft()) {
    throw maybeArticleExists.value;
  }

  articleExists = maybeArticleExists.value;
});

Then(/^Article.exists returns (.*)$/, async (exists: string) => {
  expect(articleExists).to.equal(exists === 'true');
});

Given(
  /^we have an article object with the id "([\w-]+)"$/,
  async (articleId: string) => {
    article = makeArticleData({ id: articleId });
  }
);

When('we call Article.save on the article object', async () => {
  const maybeArticle = await mockArticleRepo.save(article);

  if (maybeArticle.isLeft()) {
    throw maybeArticle.value;
  }

  saveArticle = maybeArticle.value;
});

Then('the article object should be saved', async () => {
  expect(saveArticle).to.eql(article);
});
