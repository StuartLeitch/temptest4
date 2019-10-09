import {BaseMockRepo} from '../../../../core/tests/mocks/BaseMockRepo';

import {ArticleRepoContract} from '../articleRepo';
import {Article} from '../../domain/Article';
import {ArticleId} from '../../domain/ArticleId';

export class MockArticleRepo extends BaseMockRepo<Article>
  implements ArticleRepoContract {
  constructor() {
    super();
  }

  public async findById(articleId: string): Promise<Article> {
    const matches = this._items.filter(i => i.id.toString() === articleId);
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getAuthorOfArticle(articleId: ArticleId): Promise<unknown> {
    return null;
  }

  public async exists(article: Article): Promise<boolean> {
    const found = this._items.filter(i => this.compareMockItems(i, article));
    return found.length !== 0;
  }

  public async save(article: Article): Promise<Article> {
    const alreadyExists = await this.exists(article);

    if (alreadyExists) {
      this._items.map(i => {
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

  public compareMockItems(a: Article, b: Article): boolean {
    return a.id.equals(b.id);
  }
}
