import {
  ValueObjectProps,
  UniqueEntityID,
  GuardArgument,
  ValueObject,
  Guard,
} from '@hindawi/shared';

import { Issn } from './issn';

export interface JournalProps extends ValueObjectProps {
  phenomId: UniqueEntityID;
  name: string;
  code: string;
}

export interface SourceJournalProps extends JournalProps {
  eissn?: Issn;
  pissn: Issn;
}

export class Journal extends ValueObject<JournalProps> {
  get phenomId(): UniqueEntityID {
    return this.props.phenomId;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: JournalProps) {
    super(props);
  }

  static create(props: JournalProps): Journal {
    const guardArgs: GuardArgument[] = [
      { argument: props.phenomId, argumentName: 'phenomId' },
      { argument: props.code, argumentName: 'code' },
      { argument: props.name, argumentName: 'name' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (guardResult.failed) {
      throw guardResult;
    }

    return new Journal(props);
  }
}

export class SourceJournal extends ValueObject<SourceJournalProps> {
  get phenomId(): UniqueEntityID {
    return this.props.phenomId;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get pissn(): Issn {
    return this.props.pissn;
  }

  get eissn(): Issn | null {
    return this.props.eissn || null;
  }

  private constructor(props: SourceJournalProps) {
    super(props);
  }

  static create(props: SourceJournalProps): SourceJournal {
    const guardArgs: GuardArgument[] = [
      { argument: props.phenomId, argumentName: 'phenomId' },
      { argument: props.code, argumentName: 'code' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.pissn, argumentName: 'pissn' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (guardResult.failed) {
      throw guardResult;
    }

    return new SourceJournal(props);
  }
}
