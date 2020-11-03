import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { ArticleRepoContract } from '../articleRepo';
import { Article } from '../../domain/Article';
import { ArticleId } from '../../domain/ArticleId';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { Manuscript } from '../../domain/Manuscript';

type PhenomManuscript = Article | Manuscript;

export class MockArticleRepo
  extends BaseMockRepo<PhenomManuscript>
  implements ArticleRepoContract {
  deletedItems: Manuscript[] = [];

  constructor() {
    super();
  }

  public async findById(manuscriptId: ManuscriptId): Promise<PhenomManuscript> {
    const match = this._items.find((i) => i.manuscriptId.equals(manuscriptId));

    return match ? match : null;
  }

  public async findByCustomId(
    customId: ManuscriptId | string
  ): Promise<PhenomManuscript> {
    if (customId instanceof ManuscriptId) {
      return this.findById(customId);
    }

    const match = this._items.find((item) => item.customId === customId);
    return match ? match : null;
  }

  public async getAuthorOfArticle(articleId: ArticleId): Promise<unknown> {
    return null;
  }

  public async exists(article: PhenomManuscript): Promise<boolean> {
    const found = this._items.filter((i) => this.compareMockItems(i, article));
    return found.length !== 0;
  }

  public filterBy(criteria): PhenomManuscript[] {
    const [condition, field] = Object.entries(criteria)[0];

    const conditionsMaps = {
      whereNotNull: (value) => value !== null,
    };

    return this._items.filter((i) => {
      return conditionsMaps[condition].call(i, field);
    });
  }

  public async save(article: PhenomManuscript): Promise<PhenomManuscript> {
    const alreadyExists = await this.exists(article);

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, article)) {
          return article;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(article);
    }

    return article;
  }

  public async delete(manuscript: Manuscript): Promise<void> {
    this.deletedItems.push(manuscript);
  }

  public async restore(manuscript: Manuscript): Promise<void> {
    const index = this.deletedItems.findIndex((item) =>
      item.id.equals(manuscript.id)
    );
    if (index >= 0) {
      this.deletedItems.splice(index, 1);
    }
  }

  public async update(manuscript: Manuscript): Promise<Manuscript> {
    const index = this._items.findIndex((item) => item.id === manuscript.id);
    if (index >= 0) {
      this._items[index] = manuscript;
    }
    return manuscript;
  }

  public compareMockItems(a: PhenomManuscript, b: PhenomManuscript): boolean {
    return a.id.equals(b.id);
  }
}
