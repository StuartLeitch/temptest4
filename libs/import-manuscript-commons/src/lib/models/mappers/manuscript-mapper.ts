import { UniqueEntityID, Mapper } from '@hindawi/shared';

import { ManuscriptProps, Manuscript } from '../manuscript';

import { SourceJournalMapper, JournalMapper } from './journal-mapper';
import { AuthorMapper } from './author-mapper';
import { FileMapper } from './file-mapper';

interface RawAuthorProps {
  affiliationRorId?: string;
  isCorresponding: boolean;
  affiliationName: string;
  isSubmitting: boolean;
  countryCode: string;
  givenName: string;
  surname: string;
  email: string;
}
interface RawJournalProps {
  phenomId: string;
  name: string;
  code: string;
}

interface RawSourceJournalProps {
  phenomId: string;
  name: string;
  code: string;
  eissn?: string;
  pissn: string;
}

interface RawFileProps {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface RawManuscriptProps {
  sourceManuscriptId: string;
  articleTypeId: string;
  destinationJournal: RawJournalProps;
  articleAbstract: string;
  authors: Array<RawAuthorProps>;
  sourceJournal: RawSourceJournalProps;
  files: Array<RawFileProps>;
  title: string;

  conflictOfInterest?: string;
  foundingStatement?: string;
  dataAvailability?: string;
  preprintValue?: string;
}

export class ManuscriptMapper extends Mapper<Manuscript> {
  static toDomain(raw: RawManuscriptProps): Manuscript {
    const props: ManuscriptProps = {
      destinationJournal: JournalMapper.toDomain(raw.destinationJournal),
      sourceManuscriptId: new UniqueEntityID(raw.sourceManuscriptId),
      sourceJournal: SourceJournalMapper.toDomain(raw.sourceJournal),
      articleTypeId: new UniqueEntityID(raw.articleTypeId),
      authors: raw.authors.map(AuthorMapper.toDomain),
      files: raw.files.map(FileMapper.toDomain),
      articleAbstract: raw.articleAbstract,
      title: raw.title,

      conflictOfInterest: raw.conflictOfInterest,
      foundingStatement: raw.foundingStatement,
      dataAvailability: raw.dataAvailability,
      preprintValue: raw.preprintValue,
    };

    return Manuscript.create(props);
  }

  static toPersistance(manuscript: Manuscript): RawManuscriptProps {
    return {
      sourceManuscriptId: manuscript.sourceManuscriptId.toString(),
      authors: manuscript.authors.map(AuthorMapper.toPersistance),
      files: manuscript.files.map(FileMapper.toPersistance),
      articleTypeId: manuscript.articleTypeId.toString(),
      conflictOfInterest: manuscript.conflictOfInterest,
      foundingStatement: manuscript.foundingStatement,
      dataAvailability: manuscript.dataAvailability,
      articleAbstract: manuscript.articleAbstract,
      preprintValue: manuscript.preprintValue,
      title: manuscript.title,
      sourceJournal: SourceJournalMapper.toPersistance(
        manuscript.sourceJournal
      ),
      destinationJournal: JournalMapper.toPersistance(
        manuscript.destinationJournal
      ),
    };
  }
}
