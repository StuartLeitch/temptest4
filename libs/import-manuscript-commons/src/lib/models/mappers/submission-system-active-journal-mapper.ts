import { Mapper, UniqueEntityID } from '@hindawi/shared';

import { IssnType, Issn } from '../issn';
import {
  SourceJournalProps,
  SourceJournal,
  JournalProps,
  Journal,
} from '../journal';
import {ActiveJournal, ActiveJournalProps} from "../submission-system-models/active-journal";

export interface RawJournalProps {
  id: string;
  name: string;
  code: string;
  issn: string;
  email: string;
  isActive: boolean;
  apc: number;
}

export class SubmissionSystemActiveJournalMapper extends Mapper<ActiveJournal> {
  static toDomain(raw: RawJournalProps): ActiveJournal {
    const props: ActiveJournalProps = {
      apc: raw.apc,
      email: raw.email,
      isActive: raw.isActive,
      issn: raw.issn,
      id: raw.id,
      name: raw.name,
      code: raw.code
    };

    return ActiveJournal.create(props);
  }

  static toPersistence(journal: ActiveJournal): RawJournalProps {
    return {
      apc: journal.apc,
      code: journal.code,
      email: journal.email,
      id: journal.id,
      isActive: journal.isActive,
      issn: journal.issn,
      name: journal.name
    };
  }
}

