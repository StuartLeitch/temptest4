import {
  ValueObjectProps,
  UniqueEntityID,
  GuardArgument,
  ValueObject,
  Guard, GuardFail,
} from '@hindawi/shared';

import {Issn} from './issn';

export interface JournalProps extends ValueObjectProps {
  phenomId: UniqueEntityID;
  name: string;
  code: string;
}

export interface SourceJournalProps extends JournalProps {
  eissn?: Issn;
  pissn?: Issn;
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
      {argument: props.phenomId, argumentName: 'phenomId'},
      {argument: props.code, argumentName: 'code'},
      {argument: props.name, argumentName: 'name'},
    ];

    Guard.againstNullOrUndefinedBulk(guardArgs).throwIfFailed();
    Guard.againstEmpty(props.name, "name").throwIfFailed()

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
      {argument: props.phenomId, argumentName: 'source journal phenomId'},
      {argument: props.code, argumentName: 'source journal code'},
      {argument: props.name, argumentName: 'source journal name'},
    ];

    Guard.againstNullOrUndefinedBulk(guardArgs).throwIfFailed();
    Guard.againstEmpty(props.name, "source journal title").throwIfFailed()
    //TODO Seems like neither the pissn or eissn is actually required
    // Guard.aOrB(props.pissn, "source journal pissn", props.eissn, "source journal eissn").throwIfFailed()
    // const emptyPissn = Guard.againstEmpty(props.pissn.value, "source journal pissn")
    // const emptyEissn = Guard.againstEmpty(props.eissn.value, "source journal eissn")
    // if(emptyEissn.failed && emptyPissn.failed)
    //   throw new GuardFail(`Both the issn and pissn are empty`)
    return new SourceJournal(props);
  }
}
