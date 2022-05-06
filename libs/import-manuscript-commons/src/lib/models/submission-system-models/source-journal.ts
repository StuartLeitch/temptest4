import {ValueObject, ValueObjectProps} from "@hindawi/shared";

export interface SourceJournalProps extends ValueObjectProps{
  id: string;
  name: string;
  eissn: string;
  pissn: string;
}

export class SourceJournal extends ValueObject<SourceJournalProps>{
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get eissn(): string {
    return this.props.eissn;
  }

  get pissn(): string {
    return this.props.pissn;
  }

  private constructor(props: SourceJournalProps) {
    super(props);
  }

  static create(props: SourceJournalProps): SourceJournal {
    return new SourceJournal(props);
  }

}

