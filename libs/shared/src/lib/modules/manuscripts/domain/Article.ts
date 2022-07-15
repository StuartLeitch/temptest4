// * Core domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

import { ManuscriptId } from '../../manuscripts/domain/ManuscriptId';

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
  datePublished?: Date;
  preprintValue?: string;
  journalTitle?: string;
  is_cascaded?: number;
  taEligible: boolean;
  taFundingApproved: boolean | null;
}

export class Article extends AggregateRoot<ArticleProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get manuscriptId(): ManuscriptId {
    return ManuscriptId.create(this._id);
  }

  get authorSurname(): string {
    return this.props.authorSurname;
  }

  set authorSurname(surname: string) {
    this.props.authorSurname = surname;
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

  set journalId(journalId: string) {
    this.props.journalId = journalId;
  }

  get journalTitle(): string {
    return this.props.journalTitle;
  }

  set journalTitle(journalTitle) {
    this.props.journalTitle = journalTitle;
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

  set datePublished(publishedDate: Date) {
    this.props.datePublished = publishedDate;
  }

  get datePublished(): Date {
    return this.props.datePublished;
  }

  get preprintValue(): string {
    return this.props.preprintValue;
  }

  set preprintValue(preprintValue: string) {
    this.props.preprintValue = preprintValue;
  }

  get is_cascaded(): number {
    return this.props.is_cascaded;
  }

  set is_cascaded(isCascaded: number) {
    this.props.is_cascaded = isCascaded;
  }

  get taEligible(): boolean {
    return this.props.taEligible;
  }

  set taEligible(taEligible: boolean) {
    this.props.taEligible = taEligible;
  }

  get taFundingApproved(): boolean {
    return this.props.taFundingApproved;
  }

  set taFundingApproved(taFundingApproved: boolean) {
    this.props.taFundingApproved = taFundingApproved;
  }

  private constructor(props: ArticleProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: ArticleProps, id?: UniqueEntityID): Either<GuardFailure, Article> {
    const article = new Article(
      {
        ...props,
        created: props.created ? props.created : new Date(),
      },
      id
    );

    return right(article);
  }

  public markAsPublished(published?: string): void {
    const publishedDate = published ? new Date(published) : new Date();
    this.props.datePublished = publishedDate;
  }
}
