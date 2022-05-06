import { Mapper } from '@hindawi/shared';
import {
  DraftSubmission,
  DraftSubmissionProps,
} from '../submission-system-models/draft-submission';

export interface RawDraftSubmissionProps {
  id: string;
}

export class DraftSubmissionMapper extends Mapper<DraftSubmission> {
  static toDomain(raw: Partial<RawDraftSubmissionProps>): DraftSubmission {
    const props: DraftSubmissionProps = {
      id: raw.id,
    };

    return DraftSubmission.create(props);
  }

  static toPersistance(
    draftSubmission: DraftSubmission
  ): RawDraftSubmissionProps {
    return {
      id: draftSubmission.id,
    };
  }
}
