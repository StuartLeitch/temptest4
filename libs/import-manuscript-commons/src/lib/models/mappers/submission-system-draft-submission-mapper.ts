import { Mapper } from '@hindawi/shared';
import {
  DraftSubmission,
  DraftSubmissionProps,
} from '../submission-system-models/draft-submission';

export interface RawDraftSubmissionProps {
  id: string;
  submissionId: string;
}

export class SubmissionSystemDraftSubmissionMapper extends Mapper<DraftSubmission> {
  static toDomain(raw: Partial<RawDraftSubmissionProps>): DraftSubmission {
    const props: DraftSubmissionProps = {
      manuscriptId: raw.id,
      submissionId: raw.submissionId,
    };

    return DraftSubmission.create(props);
  }

  static toPersistance(
    draftSubmission: DraftSubmission
  ): RawDraftSubmissionProps {
    return {
      id: draftSubmission.manuscriptId,
      submissionId: draftSubmission.submissionId,
    };
  }
}
