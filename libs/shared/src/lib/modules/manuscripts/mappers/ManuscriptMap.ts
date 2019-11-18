import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Manuscript } from '../domain/Manuscript';

export class ManuscriptMap extends Mapper<Manuscript> {
  public static toDomain(raw: any): Manuscript {
    const manuscriptOrError = Manuscript.create(
      {
        title: raw.title,
        customId: raw.customId,
        created: raw.created,
        articleType: raw.articleType,
        authorEmail: raw.authorEmail,
        authorCountry: raw.authorCountry,
        authorSurname: raw.authorSurname
      },
      new UniqueEntityID(raw.id)
    );

    manuscriptOrError.isFailure ? console.log(manuscriptOrError) : '';

    return manuscriptOrError.isSuccess ? manuscriptOrError.getValue() : null;
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
      created: manuscript.props.created,
      customId: manuscript.props.customId
    };
  }
}
