import {Article, ArticleId, ArticleMap, Knex} from '../../../../..';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {ArticleRepoContract} from './../articleRepo';

export class KnexArticleRepo extends AbstractBaseDBRepo<Knex, Article>
  implements ArticleRepoContract {
  async findById(articleId: string): Promise<Article> {
    const articleData = await this.db('articles')
      .select()
      .where('id', articleId)
      .first();

    return articleData ? ArticleMap.toDomain(articleData) : null;
  }

  getAuthorOfArticle(articleId: ArticleId): Promise<unknown> {
    return Promise.resolve(articleId);
  }

  exists(article: Article): Promise<boolean> {
    return Promise.resolve(true);
  }

  async save(article: Article): Promise<Article> {
    const {db} = this;

    await db('articles').insert(ArticleMap.toPersistence(article));

    return article;
  }
}
