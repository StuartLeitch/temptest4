import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { Article } from '../../domain/Article';
import { ArticleId } from '../../domain/ArticleId';
import { Manuscript } from '../../domain/Manuscript';
import { ArticleMap } from '../../mappers/ArticleMap';
import { ManuscriptMap } from '../../mappers/ManuscriptMap';

import { ArticleRepoContract } from '../articleRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';

export class KnexArticleRepo
  extends AbstractBaseDBRepo<Knex, Article | Manuscript>
  implements ArticleRepoContract {
  constructor(
    protected db: Knex,
    protected logger?: any,
    private models?: any,
    private invoiceRepo?: InvoiceRepoContract
  ) {
    super(db, logger);
  }

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

  async findByInvoiceId(invoiceId: InvoiceId): Promise<Manuscript> {
    const { logger } = this;
    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    const detailsQuery = this.createInvoiceDetailsQuery();

    // const filterInvoicesReadyForNetSuiteRevenueRecognition = this.filterReadyForNetSuiteRevenueRecognition();

    const filterInvoicesById: any = this.invoiceRepo.filterByInvoiceId(
      invoiceId
    );
    const sql = filterInvoicesById(detailsQuery);

    // const articleDataQuery = db(TABLES.ARTICLES)
    //   .select()
    //   .where(
    //     'customId',
    //     typeof customId === 'string' ? customId : customId.id.toString()
    //   )
    //   .first();

    logger.debug('select', {
      correlationId,
      sql: sql.toString(),
    });

    const articleData = await sql;
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

  async delete(manuscript: Manuscript): Promise<unknown> {
    const { db } = this;

    const deletedRows = await db(TABLES.ARTICLES)
      .where('id', manuscript.id.toString())
      .update({ ...ManuscriptMap.toPersistence(manuscript), deleted: 1 });

    return deletedRows
      ? deletedRows
      : Promise.reject(
          RepoError.createEntityNotFoundError(
            'manuscript',
            manuscript.id.toString()
          )
        );
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
}
