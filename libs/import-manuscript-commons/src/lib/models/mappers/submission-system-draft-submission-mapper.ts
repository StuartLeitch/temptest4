import { Mapper } from '@hindawi/shared';
import {
  DraftSubmission,
  DraftSubmissionProps,
} from '../submission-system-models/draft-submission';

export interface RawDraftSubmissionProps {
  manuscriptId: string;
  submissionId: string;
}

export class SubmissionSystemDraftSubmissionMapper extends Mapper<DraftSubmission> {
  static toDomain(raw: Partial<RawDraftSubmissionProps>): DraftSubmission {
    const props: DraftSubmissionProps = {
      manuscriptId: raw.manuscriptId,
      submissionId: raw.submissionId,
    };

    return DraftSubmission.create(props);
  }

  static toPersistance(
    draftSubmission: DraftSubmission
  ): RawDraftSubmissionProps {
    return {
      manuscriptId: draftSubmission.manuscriptId,
      submissionId: draftSubmission.submissionId,
    };
  }
}
