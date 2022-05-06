import {Mapper} from '@hindawi/shared';
import {SourceJournal, SourceJournalProps} from "../submission-system-models/source-journal";

export interface RawSourceJournalProps {
  id: string;
  name: string;
  eissn: string;
  pissn: string;
}

export class SourceJournalMapper extends Mapper<SourceJournal> {
  static toDomain(raw: RawSourceJournalProps): SourceJournal {
    const props: SourceJournalProps = {
      id: raw.id,
      name: raw.name,
      eissn: raw.eissn,
      pissn: raw.pissn,
    };

    return SourceJournal.create(props);
  }

  static toPersistence(journal: SourceJournal): RawSourceJournalProps {
    return {
      id: journal.id,
      name: journal.name,
      eissn: journal.eissn,
      pissn: journal.pissn
    };
  }
}

