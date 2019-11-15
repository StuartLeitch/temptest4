// * Core domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
import { ManuscriptId } from '../../invoices/domain/ManuscriptId';

interface ArticleProps {
  journalId?: string;
  title?: string;
  articleTypeId?: string;
  created?: Date;
  authorEmail?: string;
  authorCountry?: string;
  authorSurname?: string;
}

export class Article extends AggregateRoot<ArticleProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get manuscriptId(): ManuscriptId {
    return ManuscriptId.create(this._id).getValue();
  }

  get authorSurname(): string {
    return this.props.authorSurname;
  }

  get authorEmail(): string {
    return this.props.authorEmail;
  }

  get authorCountry(): string {
    return this.props.authorCountry;
  }

  get title(): string {
    return this.props.title;
  }

  get articleTypeId(): string {
    return this.props.articleTypeId;
  }

  get journalId(): string {
    return this.props.journalId;
  }

  private constructor(props: ArticleProps, id?: UniqueEntityID) {
    super(props, id);
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
