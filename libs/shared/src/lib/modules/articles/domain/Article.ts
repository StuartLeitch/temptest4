// * Core domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

interface ArticleProps {
  journalId?: string;
  title?: string;
  articleTypeId?: string;
  created?: Date;
}

export class Article extends AggregateRoot<ArticleProps> {
  private constructor(props: ArticleProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  public static create(
    props: ArticleProps,
    id?: UniqueEntityID
  ): Result<Article> {
    const article = new Article(
      {
        ...props,
        created: props.created ? props.created : new Date()
      },
      id
    );

    return Result.ok<Article>(article);
  }
}
