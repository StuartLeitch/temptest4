// * Core domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
import { ManuscriptId } from '../../invoices/domain/ManuscriptId';

interface ArticleProps {
  journalId?: string;
  customId: string;
  title?: string;
  articleType?: string;
  created?: Date;
  authorEmail?: string;
  authorCountry?: string;
  authorSurname?: string;
  authorFirstName?: string;
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

  set authorEmail(authorEmail: string) {
    this.props.authorEmail = authorEmail;
  }

  get authorCountry(): string {
    return this.props.authorCountry;
  }

  set authorCountry(country: string) {
    this.props.authorCountry = country;
  }

  set authorSurname(surname: string) {
    this.props.authorSurname = surname;
  }

  get authorFirstName(): string {
    return this.props.authorFirstName;
  }

  set authorFirstName(firstName: string) {
    this.props.authorFirstName = firstName;
  }

  get title(): string {
    return this.props.title;
  }

  set title(title: string) {
    this.props.title = title;
  }

  get articleType(): string {
    return this.props.articleType;
  }

  set articleType(articleType: string) {
    this.props.articleType = articleType;
  }

  get journalId(): string {
    return this.props.journalId;
  }

  get customId(): string {
    return this.props.customId;
  }

  set customId(customId: string) {
    this.props.customId = customId;
  }

  get created(): Date {
    return this.props.created;
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
