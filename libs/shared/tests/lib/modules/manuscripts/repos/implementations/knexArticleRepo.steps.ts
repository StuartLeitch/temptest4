import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { Article } from '../../../../../../src/lib/modules/manuscripts/domain/Article';
import { ArticleId } from '../../../../../../src/lib/modules/manuscripts/domain/ArticleId';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';
import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';

let mockArticleRepo: MockArticleRepo;
let article: Article;
let foundArticle: Article;
let ArticleExists: boolean;
let saveArticle;

function makeArticleData(overwrites?: any): Article {
  return ArticleMap.toDomain({
    ...overwrites,
  });
}

Before(async () => {
  mockArticleRepo = new MockArticleRepo();
});

Given(/^a article with the id "([\w-]+)"$/, async (articleId: string) => {
  article = makeArticleData({ id: articleId });
  await mockArticleRepo.save(article);
});

When(/^we call findById for "([\w-]+)"$/, async (articleId: string) => {
  const articleIdObj = ArticleId.create(new UniqueEntityID(articleId));
  foundArticle = await mockArticleRepo.findById(articleIdObj);
});

Then('findById returns the article', async () => {
  expect(foundArticle).to.equal(article);
});

When(
  /^we call findById for an un-existent article "([\w-]+)"$/,
  async (wrongArticleId: string) => {
    const id = ArticleId.create(new UniqueEntityID(wrongArticleId));
    foundArticle = await mockArticleRepo.findById(id);
  }
);

Then('findById returns null', async () => {
  expect(foundArticle).to.equal(null);
});

When(/^we call exists for ([\w-]+) article id$/, async (articleId: string) => {
  const id = ArticleId.create(new UniqueEntityID(articleId));
  foundArticle = await mockArticleRepo.findById(id);
  if (!foundArticle) {
    foundArticle = await makeArticleData({ id: articleId });
  }
  ArticleExists = await mockArticleRepo.exists(foundArticle);
});

Then(/^Article.exists returns (.*)$/, async (exists: string) => {
  expect(ArticleExists).to.equal(exists === 'true');
});

Given(
  /^we have an article object with the id "([\w-]+)"$/,
  async (articleId: string) => {
    article = makeArticleData({ id: articleId });
  }
);

When('we call Article.save on the article object', async () => {
  saveArticle = await mockArticleRepo.save(article);
});

Then('the article object should be saved', async () => {
  expect(saveArticle).to.equal(article);
});
