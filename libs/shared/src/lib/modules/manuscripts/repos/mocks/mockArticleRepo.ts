import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { ManuscriptId } from '../../../manuscripts/domain/ManuscriptId';
import { Manuscript } from '../../domain/Manuscript';
import { Article } from '../../domain/Article';

import { ArticleRepoContract } from '../articleRepo';

type PhenomManuscript = Article | Manuscript;

export class MockArticleRepo
  extends BaseMockRepo<PhenomManuscript>
  implements ArticleRepoContract {
  deletedItems: Manuscript[] = [];

  constructor() {
    super();
  }

  public async findById(
    manuscriptId: ManuscriptId
  ): Promise<Either<GuardFailure | RepoError, PhenomManuscript>> {
    const match = this._items.find((i) => i.manuscriptId.equals(manuscriptId));

    if (!match) {
      return right(null);
    }

    return right(match);
  }

  public async findByCustomId(
    customId: ManuscriptId | string
  ): Promise<Either<GuardFailure | RepoError, PhenomManuscript>> {
    const cst = typeof customId === 'string' ? customId : customId.toString();
    const match = this._items.find((i) => i.customId === cst);

    if (!match) {
      return left(
        RepoError.createEntityNotFoundError(
          'customId',
          typeof customId === 'string' ? customId : customId.id.toString()
        )
      );
    }

    return right(match);
  }

  public async exists(
    article: PhenomManuscript
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) => this.compareMockItems(i, article));
    return right(found.length !== 0);
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

  public async save(
    article: PhenomManuscript
  ): Promise<Either<GuardFailure | RepoError, PhenomManuscript>> {
    const maybeAlreadyExists = await this.exists(article);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

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

    return right(article);
  }

  public async delete(
    manuscript: Manuscript
  ): Promise<Either<GuardFailure | RepoError, void>> {
    this.deletedItems.push(manuscript);

    return right(null);
  }

  public async restore(
    manuscript: Manuscript
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const index = this.deletedItems.findIndex((item) =>
      item.id.equals(manuscript.id)
    );
    if (index >= 0) {
      this.deletedItems.splice(index, 1);
    }

    return right(null);
  }

  public async update(
    manuscript: Manuscript
  ): Promise<Either<GuardFailure | RepoError, PhenomManuscript>> {
    const index = this._items.findIndex((item) => item.id === manuscript.id);
    if (index >= 0) {
      this._items[index] = manuscript;
    }
    return right(manuscript);
  }

  public compareMockItems(a: PhenomManuscript, b: PhenomManuscript): boolean {
    return a.id.equals(b.id);
  }
}
