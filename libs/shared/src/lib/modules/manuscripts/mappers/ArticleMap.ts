import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { Article } from '../domain/Article';

export class ArticleMap extends Mapper<Article> {
  public static toDomain(raw: any): Either<GuardFailure, Article> {
    const articleOrError = Article.create(
      {
        journalId: raw.journalId,
        title: raw.title,
        customId: raw.customId,
        created: raw.created,
        articleType: raw.articleType,
        authorEmail: raw.authorEmail,
        authorCountry: raw.authorCountry,
        authorSurname: raw.authorSurname,
        authorFirstName: raw.authorFirstName,
        datePublished: raw.datePublished,
        preprintValue: raw.preprintValue,
      },
      new UniqueEntityID(raw.id)
    );

    return articleOrError;
  }

  public static toPersistence(article: Article): any {
    return {
      id: article.id.toString(),
      journalId: article.props.journalId && article.props.journalId.toString(),
      title: article.props.title,
      articleType: article.props.articleType,
      authorEmail: article.props.authorEmail,
      authorCountry: article.props.authorCountry,
      authorSurname: article.props.authorSurname,
      authorFirstName: article.props.authorFirstName,
      created: article.props.created,
      customId: article.props.customId,
      datePublished: article.props.datePublished,
      preprintValue: article.props.preprintValue,
    };
  }
}
