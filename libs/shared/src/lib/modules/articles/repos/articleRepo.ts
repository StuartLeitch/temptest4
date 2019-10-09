import {Repo} from '../../../infrastructure/Repo';
import {Article} from '../domain/Article';
import {ArticleId} from '../domain/ArticleId';

export interface ArticleRepoContract extends Repo<Article> {
  findById(articleId: string): Promise<Article>;
  getAuthorOfArticle(articleId: ArticleId): Promise<unknown>;
}
