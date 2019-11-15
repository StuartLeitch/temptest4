import { Repo } from '../../../infrastructure/Repo';
import { Article } from '../domain/Article';
import { Manuscript } from '../domain/Manuscript';
import { ArticleId } from '../domain/ArticleId';
import { ManuscriptId } from '../../invoices/domain/ManuscriptId';

export interface ArticleRepoContract extends Repo<Article | Manuscript> {
  findById(manuscriptId: ManuscriptId): Promise<Article>;
  getAuthorOfArticle(articleId: ArticleId): Promise<unknown>;
}
