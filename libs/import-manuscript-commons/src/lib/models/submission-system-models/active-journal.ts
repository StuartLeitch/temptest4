import {UniqueEntityID, ValueObject, ValueObjectProps} from "@hindawi/shared";

export interface ActiveJournalProps extends ValueObjectProps {
  id: string;
  name: string;
  code: string;
  issn: string;
  email: string;
  isActive: boolean;
  apc: number;
}

export class ActiveJournal extends ValueObject<ActiveJournalProps> {
  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get issn(): string{
    return this.props.issn;
  }

  get email(): string{
    return this.props.email;
  }

  get isActive(): boolean{
    return this.props.isActive
  }

  get apc(): number{
    return this.props.apc
  }

  private constructor(props: ActiveJournalProps) {
    super(props);
  }

  static create(props: ActiveJournalProps): ActiveJournal {
    return new ActiveJournal(props);
  }
}
