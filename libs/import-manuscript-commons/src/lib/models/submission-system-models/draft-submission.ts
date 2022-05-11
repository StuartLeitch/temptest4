import { ValueObject, ValueObjectProps } from '@hindawi/shared';

export interface DraftSubmissionProps extends ValueObjectProps {
  manuscriptId: string;
  submissionId: string;
}

export class DraftSubmission extends ValueObject<DraftSubmissionProps> {
  get manuscriptId(): string {
    return this.props.manuscriptId;
  }

  get submissionId(): string {
    return this.props.submissionId;
  }

  private constructor(props: DraftSubmissionProps) {
    super(props);
  }

  static create(props: DraftSubmissionProps): DraftSubmission {
    return new DraftSubmission(props);
  }
}
