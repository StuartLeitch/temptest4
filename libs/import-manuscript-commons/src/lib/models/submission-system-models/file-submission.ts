import { ValueObject, ValueObjectProps } from '@hindawi/shared';

export interface SubmissionFileProps extends ValueObjectProps {
  id: string;
  name: string;
  size: number;
  type: string;
}

export class SubmissionFile extends ValueObject<SubmissionFileProps> {
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get size(): number {
    return this.props.size;
  }

  get type(): string {
    return this.props.type;
  }

  private constructor(props: SubmissionFileProps) {
    super(props);
  }

  static create(props: SubmissionFileProps): SubmissionFile {
    return new SubmissionFile(props);
  }
}
