import {BaseJsonRepo} from '../../../../infrastructure/BaseJsonRepo';
import {ArticleRepoContract} from '../articleRepo';
import {Article} from '../../domain/Article';
import {ArticleId} from '../../domain/ArticleId';
import {ArticleMap} from '../../mappers/ArticleMap';

export class ArticleJsonRepo extends BaseJsonRepo<Article>
  implements ArticleRepoContract {
  private db;

  constructor(db: any) {
    super();
    this.db = db;
  }

  public async findById(articleId: string): Promise<Article> {
    const rawArticle = await this.db
      .get('articles')
      .find({id: articleId})
      .value();

    return rawArticle ? ArticleMap.toDomain(rawArticle) : null;
  }

  public async getAuthorOfArticle(articleId: ArticleId): Promise<unknown> {
    return null;
  }

  public async getArticleCollection(articleId: string): Promise<Article[]> {
    return this._items.filter(i => i.id.toString() === articleId);
  }

  public async exists(article: Article): Promise<boolean> {
    const found = this._items.filter(i => this.compareJsonItems(i, article));
    return found.length !== 0;
  }

  public async save(article: Article): Promise<Article> {
    const rawArticle = ArticleMap.toPersistence(article);
    this.db
      .get('articles')
      .push(rawArticle)
      .write();
    return article;
  }

  public compareJsonItems(a: Article, b: Article): boolean {
    return a.id.equals(b.id);
  }
}
