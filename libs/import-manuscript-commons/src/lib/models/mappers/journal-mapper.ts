import { Mapper, UniqueEntityID } from '@hindawi/shared';

import { IssnType, Issn } from '../issn';
import {
  SourceJournalProps,
  SourceJournal,
  JournalProps,
  Journal,
} from '../journal';

export interface RawJournalProps {
  phenomId: string;
  name: string;
  code: string;
}

export interface RawSourceJournalProps {
  phenomId: string;
  name: string;
  code: string;
  eissn?: string;
  pissn: string;
}

export class JournalMapper extends Mapper<Journal> {
  static toDomain(raw: RawJournalProps): Journal {
    const props: JournalProps = {
      phenomId: new UniqueEntityID(raw.phenomId),
      name: raw.name,
      code: raw.code,
    };

    return Journal.create(props);
  }

  static toPersistance(journal: Journal): RawJournalProps {
    return {
      phenomId: journal.phenomId.toString(),
      code: journal.code,
      name: journal.name,
    };
  }
}

export class SourceJournalMapper extends Mapper<SourceJournal> {
  static toDomain(raw: RawSourceJournalProps): SourceJournal {
    const props: SourceJournalProps = {
      pissn: Issn.create({ type: IssnType.ISSN, value: raw.pissn }),
      eissn: raw.eissn
        ? Issn.create({ value: raw.eissn, type: IssnType.eISSN })
        : null,
      phenomId: new UniqueEntityID(raw.phenomId),
      code: raw.code,
      name: raw.name,
    };

    return SourceJournal.create(props);
  }

  static toPersistance(sourceJournal: SourceJournal): RawSourceJournalProps {
    return {
      phenomId: sourceJournal.phenomId.toString(),
      eissn: sourceJournal.eissn?.value || '',
      pissn: sourceJournal.pissn.value,
      code: sourceJournal.code,
      name: sourceJournal.name,
    };
  }
}
