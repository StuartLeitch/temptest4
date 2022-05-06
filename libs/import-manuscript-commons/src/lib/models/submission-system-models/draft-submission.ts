import { ValueObject, ValueObjectProps } from '@hindawi/shared';

export interface DraftSubmissionProps extends ValueObjectProps {
  id: string;
}

export class DraftSubmission extends ValueObject<DraftSubmissionProps> {
  get id(): string {
    return this.props.id;
  }

  private constructor(props: DraftSubmissionProps) {
    super(props);
  }

  static create(props: DraftSubmissionProps): DraftSubmission {
    return new DraftSubmission(props);
  }
}
