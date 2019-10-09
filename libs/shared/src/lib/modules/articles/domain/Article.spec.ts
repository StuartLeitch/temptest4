import {Result} from '../../../core/logic/Result';
import {Article} from './Article';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

let articleOrError: Result<Article>;

describe('Article', () => {
  beforeEach(() => {
    articleOrError = null;
  });

  it('Should be able to be created', () => {
    articleOrError = Article.create({}, new UniqueEntityID('test-id'));

    expect(articleOrError.isSuccess).toBeTruthy();
  });
});
