import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Article } from '../domain/Article';
// import {PriceId} from '../domain/PriceId';
export class ArticleMap extends Mapper<Article> {
  public static toDomain(raw: any): Article {
    const articleOrError = Article.create(
      {
        // journalId: JournalId.create(new UniqueEntityID(raw.journalId)).getValue(),
        title: raw.title,
        customId: raw.customId,
        created: raw.created,
        articleType: raw.articleType,
        authorEmail: raw.authorEmail,
        authorCountry: raw.authorCountry,
        authorSurname: raw.authorSurname,
        authorFirstName: raw.authorFirstName
      },
      new UniqueEntityID(raw.id)
    );

    articleOrError.isFailure ? console.log(articleOrError) : '';

    return articleOrError.isSuccess ? articleOrError.getValue() : null;
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
      customId: article.props.customId
    };
  }
}
