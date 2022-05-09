import { ValueObject, ValueObjectProps } from '@hindawi/shared';

export interface SubmissionFileProps extends ValueObjectProps {
  id: string;
}

export class SubmissionFile extends ValueObject<SubmissionFileProps> {
  get id(): string {
    return this.props.id;
  }

  private constructor(props: SubmissionFileProps) {
    super(props);
  }

  static create(props: SubmissionFileProps): SubmissionFile {
    return new SubmissionFile(props);
  }
}
