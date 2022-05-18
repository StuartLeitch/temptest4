import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { TABLES } from '../../../../infrastructure/database/knex';
import { RepoError } from '../../../../infrastructure/RepoError';

import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Manuscript } from '../../domain/Manuscript';
import { Article } from '../../domain/Article';

import { ManuscriptMap } from '../../mappers/ManuscriptMap';
import { ArticleMap } from '../../mappers/ArticleMap';

import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { ArticleRepoContract } from '../articleRepo';
import Knex from 'knex';

export class KnexArticleRepo
  extends AbstractBaseDBRepo<Knex, Article | Manuscript>
  implements ArticleRepoContract
{
  constructor(
    protected db: Knex,
    protected logger?: any,
    private models?: any,
    private invoiceRepo?: InvoiceRepoContract
  ) {
    super(db, logger);
  }

  async findById(
    manuscriptId: ManuscriptId
  ): Promise<Either<GuardFailure | RepoError, Article | Manuscript>> {
    const articleData = await this.db(TABLES.ARTICLES)
      .select()
      .where('id', manuscriptId.toString())
      .first();

    if (!articleData) {
      return left(
        RepoError.createEntityNotFoundError('article', manuscriptId.toString())
      );
    }

    return ArticleMap.toDomain(articleData);
  }

  async findByCustomId(
    customId: ManuscriptId | string
  ): Promise<Either<GuardFailure | RepoError, Article | Manuscript>> {
    const { db, logger } = this;

    const articleDataQuery = db(TABLES.ARTICLES)
      .select()
      .where(
        'customId',
        typeof customId === 'string' ? customId : customId.id.toString()
      )
      .first();

    logger.debug('select', {
      sql: articleDataQuery.toString(),
    });

    let articleData;
    try {
      articleData = await articleDataQuery;
    } catch (e) {
      return left(
        RepoError.createEntityNotFoundError(
          'customId',
          typeof customId === 'string' ? customId : customId.id.toString()
        )
      );
    }

    return ArticleMap.toDomain(articleData);
  }

  private createInvoiceDetailsQuery(): any {
    const { db } = this;

    return db(TABLES.ARTICLES)
      .select('articles.*', 'invoices.id as invoiceId')
      .leftJoin(
        TABLES.INVOICE_ITEMS,
        'invoice_items.manuscriptId',
        'articles.id'
      )
      .leftJoin(TABLES.INVOICES, 'invoice_items.invoiceId', 'invoices.id');
  }

  async findByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Article | Manuscript>> {
    const { logger } = this;

    const detailsQuery = this.createInvoiceDetailsQuery();

    const filterInvoicesById: any =
      this.invoiceRepo.filterByInvoiceId(invoiceId);
    const sql = filterInvoicesById(detailsQuery);

    logger.debug('select', {
      sql: sql.toString(),
    });

    const articleData = await sql;
    return ArticleMap.toDomain(articleData);
  }

  async exists(
    article: Article
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    return right(true);
  }

  async save(
    article: Article
  ): Promise<Either<GuardFailure | RepoError, Article | Manuscript>> {
    const { db } = this;
    try {
      await db(TABLES.ARTICLES).insert(ArticleMap.toPersistence(article));
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
    return this.findById(article.manuscriptId);
  }

  async update(
    manuscript: Manuscript
  ): Promise<Either<GuardFailure | RepoError, Article | Manuscript>> {
    const { db } = this;

    const updated = await db(TABLES.ARTICLES)
      .where({ id: manuscript.id.toString() })
      .update(ManuscriptMap.toPersistence(manuscript));

    if (!updated) {
      return left(
        RepoError.createEntityNotFoundError(
          'manuscript',
          manuscript.id.toString()
        )
      );
    }

    return this.findById(manuscript.manuscriptId);
  }

  async delete(
    manuscript: Manuscript
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const deletedRows = await db(TABLES.ARTICLES)
      .where('id', manuscript.id.toString())
      .update({ ...ManuscriptMap.toPersistence(manuscript), deleted: 1 });

    if (!deletedRows) {
      return left(
        RepoError.createEntityNotFoundError(
          'manuscript',
          manuscript.id.toString()
        )
      );
    }

    return right(null);
  }

  async restore(
    manuscript: Manuscript
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const restoredRows = await db(TABLES.ARTICLES)
      .where('id', manuscript.id.toString())
      .update({ ...ManuscriptMap.toPersistence(manuscript), deleted: 0 });

    if (!restoredRows) {
      return left(
        RepoError.createEntityNotFoundError(
          'manuscript',
          manuscript.id.toString()
        )
      );
    }

    return right(null);
  }

  filterBy(criteria): unknown {
    const [condition, field] = Object.entries(criteria)[0];
    return (query) => {
      const join = query
        .leftJoin(TABLES.ARTICLES, 'articles.id', 'invoice_items.manuscriptId')
        .orderBy(field, 'desc');

      return join[condition](field);
    };
  }

  public articleInvoiceItemJoinQuery(): any {
    return (query) =>
      query
        .from('articles')
        .leftJoin(
          'invoice_items',
          'invoice_items.manuscriptId',
          '=',
          'articles.id'
        );
  }
}
