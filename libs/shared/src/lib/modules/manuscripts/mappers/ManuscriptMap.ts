import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { Manuscript } from '../domain/Manuscript';

export class ManuscriptMap extends Mapper<Manuscript> {
  public static toDomain(raw: any): Either<GuardFailure, Manuscript> {
    const manuscriptOrError = Manuscript.create(
      {
        title: raw.title,
        customId: raw.customId,
        created: raw.created,
        articleType: raw.articleType,
        authorEmail: raw.authorEmail,
        authorCountry: raw.authorCountry,
        authorSurname: raw.authorSurname,
        datePublished: raw.datePublished,
        preprintValue: raw.preprintValue,
        journalId: raw.journalId,
      },
      new UniqueEntityID(raw.id)
    );

    return manuscriptOrError;
  }

  public static toPersistence(manuscript: Manuscript): any {
    return {
      id: manuscript.id.toString(),
      journalId:
        manuscript.props.journalId && manuscript.props.journalId.toString(),
      title: manuscript.props.title,
      articleType: manuscript.props.articleType,
      authorEmail: manuscript.props.authorEmail,
      authorCountry: manuscript.props.authorCountry,
      authorSurname: manuscript.props.authorSurname,
      authorFirstName: manuscript.props.authorFirstName,
      created: manuscript.props.created,
      customId: manuscript.props.customId,
      datePublished: manuscript.props.datePublished,
      preprintValue: manuscript.props.preprintValue,
    };
  }
}
