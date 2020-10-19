import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';

import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { Article } from '../../domain/Article';
import { ArticleId } from '../../domain/ArticleId';
import { Manuscript } from '../../domain/Manuscript';
import { ArticleMap } from '../../mappers/ArticleMap';
import { ManuscriptMap } from '../../mappers/ManuscriptMap';

import { ArticleRepoContract } from '../articleRepo';

export class KnexArticleRepo
  extends AbstractBaseDBRepo<Knex, Article | Manuscript>
  implements ArticleRepoContract {
  async findById(
    manuscriptId: ManuscriptId | string
  ): Promise<Article | Manuscript> {
    if (typeof manuscriptId === 'string') {
      manuscriptId = ManuscriptId.create(
        new UniqueEntityID(manuscriptId)
      ).getValue();
    }
    const articleData = await this.db(TABLES.ARTICLES)
      .select()
      .where('id', manuscriptId.id.toString())
      .first();

    return articleData ? ArticleMap.toDomain(articleData) : null;
  }

  async findByCustomId(customId: ManuscriptId | string): Promise<Article> {
    const { db, logger } = this;

    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    const articleDataQuery = db(TABLES.ARTICLES)
      .select()
      .where(
        'customId',
        typeof customId === 'string' ? customId : customId.id.toString()
      )
      .first();

    logger.debug('select', {
      correlationId,
      sql: articleDataQuery.toString(),
    });

    let articleData;
    try {
      articleData = await articleDataQuery;
    } catch (e) {
      throw RepoError.createEntityNotFoundError(
        'customId',
        typeof customId === 'string' ? customId : customId.id.toString()
      );
    }

    return articleData ? ArticleMap.toDomain(articleData) : null;
  }

  getAuthorOfArticle(articleId: ArticleId): Promise<unknown> {
    return Promise.resolve(articleId);
  }

  exists(article: Article): Promise<boolean> {
    return Promise.resolve(true);
  }

  async save(article: Article): Promise<Article> {
    const { db } = this;

    await db(TABLES.ARTICLES).insert(ArticleMap.toPersistence(article));

    return article;
  }

  async update(manuscript: Manuscript): Promise<Manuscript> {
    const { db } = this;

    const updated = await db(TABLES.ARTICLES)
      .where({ id: manuscript.id.toString() })
      .update(ManuscriptMap.toPersistence(manuscript));

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'manuscript',
        manuscript.id.toString()
      );
    }

    return manuscript;
  }

  async delete(manuscript: Manuscript): Promise<void> {
    const { db } = this;

    const deletedRows = await db(TABLES.ARTICLES)
      .where('id', manuscript.id.toString())
      .update({ ...ManuscriptMap.toPersistence(manuscript), deleted: 1 });

    if (!deletedRows) {
      throw RepoError.createEntityNotFoundError(
        'manuscript',
        manuscript.id.toString()
      );
    }
  }

  async restore(manuscript: Manuscript): Promise<void> {
    const { db } = this;

    const restoredRows = await db(TABLES.ARTICLES)
      .where('id', manuscript.id.toString())
      .update({ ...ManuscriptMap.toPersistence(manuscript), deleted: 0 });

    if (!restoredRows) {
      throw RepoError.createEntityNotFoundError(
        'manuscript',
        manuscript.id.toString()
      );
    }
  }
}
