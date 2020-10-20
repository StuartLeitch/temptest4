import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { ArticleRepoContract } from '../articleRepo';
import { Article } from '../../domain/Article';
import { ArticleId } from '../../domain/ArticleId';
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { Manuscript } from '../../domain/Manuscript';

export class MockArticleRepo
  extends BaseMockRepo<Article>
  implements ArticleRepoContract {
  constructor() {
    super();
  }

  public async findById(manuscriptId: ManuscriptId): Promise<Article> {
    const match = this._items.find((i) => i.manuscriptId.equals(manuscriptId));

    return match ? match : null;
  }

  public async findByCustomId(
    customId: ManuscriptId | string
  ): Promise<Article> {
    if (customId instanceof ManuscriptId) {
      return this.findById(customId);
    }

    const match = this._items.find((item) => item.customId === customId);
    return match ? match : null;
  }

  public async getAuthorOfArticle(articleId: ArticleId): Promise<unknown> {
    return null;
  }

  public async exists(article: Article): Promise<boolean> {
    const found = this._items.filter((i) => this.compareMockItems(i, article));
    return found.length !== 0;
  }

  public async save(article: Article): Promise<Article> {
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
    const index = this._items.findIndex((item) => item.id === manuscript.id);
    index < 0 ? null : this._items.splice(index, 1);
  }

  public async restore(manuscript: Manuscript): Promise<void> {
    const index = this._items.findIndex((item) => item.id === manuscript.id);
    const removed = this._items.splice(index, 1);
    index < 0 ? this._items.splice(index, 0, ...removed) : null;
  }

  public async update(manuscript: Manuscript): Promise<Manuscript> {
    const index = this._items.findIndex((item) => item.id === manuscript.id);
    index < -1 ? null : (this._items[index] = manuscript as Article);
    return manuscript;
  }

  public compareMockItems(a: Article, b: Article): boolean {
    return a.id.equals(b.id);
  }
}
