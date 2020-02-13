import { Repo } from '../../../infrastructure/Repo';

import { ManuscriptId } from '../../invoices/domain/ManuscriptId';
import { Article } from '../domain/Article';
import { ArticleId } from '../domain/ArticleId';
import { Manuscript } from '../domain/Manuscript';

export interface ArticleRepoContract extends Repo<Article | Manuscript> {
  findById(manuscriptId: ManuscriptId): Promise<Article | Manuscript>;
  findByCustomId(customId: ManuscriptId | string): Promise<Article>;
  getAuthorOfArticle(articleId: ArticleId): Promise<unknown>;
  delete(manuscript: Manuscript): Promise<unknown>;
  update(manuscript: Manuscript): Promise<Manuscript>;
}
