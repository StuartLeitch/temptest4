import {Knex, makeDb, destroyDb} from '../../../../infrastructure/database/knex';
import {KnexArticleRepo} from './knexArticleRepo';

describe('ArticleRepo', () => {
  let db: Knex;

  afterAll(async () => {
    await destroyDb(db);
  });

  beforeAll(async () => {
    db = await makeDb();
  });

  test.skip('findById()', async () => {
    const repo = new KnexArticleRepo(db);

    const result = await repo.findById('a1');

    expect(result).toBeTruthy();
  });
});
