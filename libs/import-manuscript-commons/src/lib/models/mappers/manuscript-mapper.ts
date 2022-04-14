import { UniqueEntityID, Mapper } from '@hindawi/shared';

import { ManuscriptProps, Manuscript } from '../manuscript';

import { RawFoundingProps, FoundingMapper } from './founding-mapper';
import { RawAuthorProps, AuthorMapper } from './author-mapper';
import { RawFileProps, FileMapper } from './file-mapper';
import {
  RawSourceJournalProps,
  SourceJournalMapper,
  RawJournalProps,
  JournalMapper,
} from './journal-mapper';

export interface RawManuscriptProps {
  sourceManuscriptId: string;
  articleTypeId: string;
  destinationJournal: RawJournalProps;
  articleAbstract: string;
  authors: Array<RawAuthorProps>;
  sourceJournal: RawSourceJournalProps;
  files: Array<RawFileProps>;
  title: string;

  conflictOfInterest?: string;
  dataAvailability?: string;
  preprintValue?: string;
  founding?: RawFoundingProps;
}

export class ManuscriptMapper extends Mapper<Manuscript> {
  static toDomain(raw: RawManuscriptProps): Manuscript {
    const props: ManuscriptProps = {
      sourceManuscriptId:
        raw.sourceManuscriptId && new UniqueEntityID(raw.sourceManuscriptId),
      articleTypeId: raw.articleTypeId && new UniqueEntityID(raw.articleTypeId),
      destinationJournal: JournalMapper.toDomain(raw.destinationJournal),
      sourceJournal: SourceJournalMapper.toDomain(raw.sourceJournal),
      authors: raw.authors.map(AuthorMapper.toDomain),
      files: raw.files.map(FileMapper.toDomain),
      articleAbstract: raw.articleAbstract,
      title: raw.title,

      founding: raw.founding ? FoundingMapper.toDomain(raw.founding) : null,
      conflictOfInterest: raw.conflictOfInterest,
      dataAvailability: raw.dataAvailability,
      preprintValue: raw.preprintValue,
    };

    return Manuscript.create(props);
  }

  static toPersistance(manuscript: Manuscript): RawManuscriptProps {
    return {
      sourceManuscriptId: manuscript.sourceManuscriptId.toString(),
      authors: manuscript.authors.map(AuthorMapper.toPersistance),
      founding: FoundingMapper.toPersistance(manuscript.founding),
      files: manuscript.files.map(FileMapper.toPersistance),
      articleTypeId: manuscript.articleTypeId.toString(),
      conflictOfInterest: manuscript.conflictOfInterest,
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
