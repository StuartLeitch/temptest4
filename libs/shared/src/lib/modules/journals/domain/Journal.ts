import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Guard } from '../../../core/logic/Guard';

import { Email } from './../../../domain/Email';
import { Name } from './../../../domain/Name';

import { EditorialBoard } from './EditorialBoard';
import { JournalId } from './JournalId';

export interface JournalProps {
  name: Name;
  email: Email; // ? Why the fuck a journal needs an email
  articleProcessingCharge: number; // * this should be a currency object value
  code: string; // * unique journal reference
  issn: string; // * external journal reference, just like
  editorialBoard?: EditorialBoard;
}

export type JournalCollection = Journal[];

export class Journal extends AggregateRoot<JournalProps> {
  get journalId(): JournalId {
    return JournalId.create(this._id);
  }

  get name(): Name {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get code(): string {
    return this.props.code;
  }

  get issn(): string {
    return this.props.issn;
  }

  get articleProcessingCharge(): number {
    return this.props.articleProcessingCharge;
  }

  get editorialBoard(): EditorialBoard {
    return this.props.editorialBoard;
  }

  set editorialBoard(editorialBoard: EditorialBoard) {
    this.props.editorialBoard = editorialBoard;
  }

  private constructor(props: JournalProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: JournalProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Journal> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'journal name' },
      { argument: props.email, argumentName: 'journal email' },
      { argument: props.code, argumentName: 'journal code' },
      { argument: props.issn, argumentName: 'journal issn' },
    ]);

    if (!nullGuard.succeeded) {
      return left(new GuardFailure(nullGuard.message));
    } else {
      const defaultJournalProps: JournalProps = {
        ...props,
      };

      const journal = new Journal(defaultJournalProps, id);

      return right(journal);
    }
  }
}
